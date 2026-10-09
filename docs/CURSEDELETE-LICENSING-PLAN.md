# CurseDelete licensing on repasscloud.com: implementation plan

**Status:** plan only, nothing built yet (written 9 October 2026).
**Goal:** sell, issue, activate and manage CurseDelete 2 licences from the repasscloud.com Cloudflare Worker itself. The site hosts every API key and signing key; there is no separate licensing server.

This replaces two things that exist today:

1. The Stripe **test-mode Payment Links** in `CURSEDELETE_STRIPE_LINKS` (`src/consts.ts`), which take money but issue nothing.
2. The separate .NET **LicenseServer** (`danijeljw-RPC/licsense-server-poc`) that the CLI was originally built against.

The model to follow is how-to-use-ai.com (`~/Developer/how-to-use-ai.com/wwwroot`), which already runs a full store on its own Worker: server-created Stripe Checkout Sessions, a signed webhook, D1 for orders and entitlements, a MailerSend outbox with retries, a cron handler for reconciliation, test/live mode isolation, and a launch gate.

---

## 1. What the CLI already expects (fixed contract)

The CurseDelete 2 CLI (`repasscloud/cursedelete-2`, crate `cursdel-license`) already implements the client side. The Worker has to match it **byte for byte**; read these before writing code:

- `LICENSING-INTEGRATION.md` (protocol, sections 4, 6 and 7)
- `docs/LICENSING.md` (user-facing behaviour)
- `docs/adr/0004-licensing-integration.md`
- `crates/cursdel-license/src/{client.rs,schema.rs,canonical_json.rs,verify.rs,trusted_keys.rs,device.rs}`
- Test fixtures: `crates/cursdel-license/tests/fixtures/{test.license,exhaustive.license,test2026.public.pem}`

Key facts:

| Item | Value |
|---|---|
| Product code | `cursedelete` |
| Envelope format | `software-license-v1` |
| Signature | `ECDSA-P256-SHA256` over the **canonical JSON** of the envelope minus `signature`, Base64 of the raw 64-byte `r‖s` (IEEE P1363). WebCrypto `crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'})` produces exactly this format. |
| Canonical JSON | Keys sorted ordinally at every level, no whitespace, **.NET `Utf8JsonWriter` default escaping** (`&'+<>` and backtick escaped as `\uXXXX`, all non-ASCII as UTF-16 `\uXXXX`, uppercase hex). Port `canonical_json.rs` exactly and test it against `exhaustive.license`. |
| Trusted key IDs compiled into the CLI | `primary-2026`, `secondary-2026` |
| Editions understood by the CLI | `community`, `education`, `business`, `enterprise` (plus `project`, `smb`, `corporate`, `consumer` which map onto them). Unknown editions fail closed to Community. |
| Only runtime-gated feature | `--close-remote-locks` (Business/Enterprise) |
| Device binding scheme | `os-machine-id-sha256-v1`, one active activation per licence |
| Server URL | `CURSDEL_LICENSE_SERVER_URL`. **No production default is compiled in** (dev default `http://localhost:8080`). |

### Endpoints the Worker must serve

All under `https://repasscloud.com`, JSON in and out, Problem-style errors (`{ "title", "detail", "status" }`) on non-2xx:

| Method and path | Body | Returns |
|---|---|---|
| `POST /api/v1/licenses/{licenseId}/activate` | `requestId`, `activationCode`, `activationToken` (32 random bytes, Base64), `mode` (`online`/`offline`), `device {scheme, deviceId, deviceName?}` | `licenseId`, `activationId`, `status`, `signedLicense` (envelope as a JSON **string**), `refreshAfter`, `leaseExpiresAt` (both `null` for offline) |
| `POST /api/v1/activations/{activationId}/validate` | `activationToken`, `deviceId` | status only |
| `POST /api/v1/activations/{activationId}/refresh` | same | same shape as activate, new envelope and lease. Offline activations return 409. |
| `POST /api/v1/activations/{activationId}/deactivate` | same | frees the seat |

The `/api/*` prefix already runs the Worker first (`wrangler.toml` → `run_worker_first = ["/api/*"]`), so no routing change is needed.

---

## 2. Architecture

Keep the site **static**. Grow `cloudflare/worker.ts` (today it only serves `/api/contact`) into a small router. Don't convert the Astro site to server output; licensing is an API, not pages.

```
repasscloud.com (Worker: repasscloud-wwwroot)
├── static Astro site (dist/, ASSETS binding)          unchanged
├── /api/contact                                        exists
├── /api/licensing/checkout        POST  start a purchase      (new)
├── /api/licensing/free            POST  Community/Education    (new)
├── /api/stripe/webhook            POST  Stripe events          (new)
├── /api/v1/licenses/{id}/activate POST  CLI activation         (new)
├── /api/v1/activations/{id}/*     POST  validate/refresh/deact (new)
├── /api/admin/licensing/*         admin API, Cloudflare Access (new)
└── scheduled() every 5 min        outbox, reconciliation, cleanup (new)
Bindings: D1 LICENSING_DB, secrets (below). No R2 needed.
```

Suggested source layout (mirrors how-to-use-ai.com's `src/lib/store/`):

```
cloudflare/
  worker.ts                 router + scheduled()
  contact.ts                exists
  licensing/
    config.ts               env parsing, test/live mode, launch gates
    canonical-json.ts       port of canonical_json.rs (must pass fixture tests)
    sign.ts                 import PKCS8 key, sign envelope, keyId
    envelope.ts             build software-license-v1 JSON
    activation.ts           activate/validate/refresh/deactivate
    issue.ts                create licence + entitlement + activation code
    checkout.ts             Stripe Checkout Session creation
    webhook.ts              Stripe signature check + idempotent fulfilment
    free.ts                 Community/Education issuance
    email.ts                MailerSend outbox (reuse the contact-form sender)
    admin.ts                Access-protected admin API
    maintenance.ts          cron jobs
    http.ts                 bounded bodies, Problem responses, rate limits
migrations/0001_licensing.sql
tests/                      vitest, as in how-to-use-ai.com
```

Port rather than reinvent from how-to-use-ai.com `wwwroot/src/lib/`: `stripe.ts` (`verifyStripeEvent`), `store/webhook.ts` (idempotent event handling, reversal tombstones), `store/checkout.ts` (session params, attempt locking), `store/email.ts` (outbox with leases), `store/tokens.ts` (random tokens, hashing), `store/maintenance.ts`, `store/http.ts` (bounded bodies, private headers), `turnstile.ts`, and the test helpers (`tests/helpers/fake-d1.ts`, `sqlite-store.ts`).

---

## 3. Secrets and configuration (all held by the Worker)

Add these **as runtime secrets on `repasscloud-wwwroot`**, not as build variables:

```
npx wrangler secret put <NAME> --name repasscloud-wwwroot
```

| Secret | Purpose |
|---|---|
| `MAILERSEND_API_KEY` | exists already; licence emails reuse it |
| `STRIPE_SECRET_KEY` | restricted key: Checkout Sessions write, Payment Intents read, Customers write |
| `STRIPE_WEBHOOK_SECRET` | signing secret for the `/api/stripe/webhook` endpoint |
| `LICENSE_SIGNING_KEY` | ECDSA P-256 private key, PKCS8 PEM, for the key ID in `LICENSE_SIGNING_KEY_ID` |
| `ACTIVATION_CODE_PEPPER` | 32+ random bytes; activation codes are stored only as `HMAC-SHA256(pepper, code)` |
| `TURNSTILE_SECRET_KEY` | bot check on the free-licence form |

Plain variables in `wrangler.toml` `[vars]`:

| Var | Example |
|---|---|
| `LICENSING_ENABLED` | `"false"` until launch |
| `LICENSING_MODE` | `"test"` or `"live"` (every table row carries `mode`, as in how-to-use-ai.com) |
| `LICENSE_SIGNING_KEY_ID` | `"primary-2026"` |
| `STRIPE_PRICE_BUSINESS`, `STRIPE_PRICE_ENTERPRISE` | Stripe Price IDs (per mode) |
| `LEASE_REFRESH_HOURS`, `LEASE_DAYS` | `24`, `7` (match the .NET server defaults: confirm) |
| `TURNSTILE_SITE_KEY` | public |
| `LICENSING_NOTIFY_EMAIL` | where new-order notices go |
| `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` | Cloudflare Access app for admin routes |

### The signing key decision (blocking)

The CLI only trusts `primary-2026` and `secondary-2026`. Either:

- **A (recommended):** export the existing `primary-2026` private key from the .NET LicenseGenerator key store, convert it to PKCS8 PEM, and load it as `LICENSE_SIGNING_KEY`. Existing CLI builds verify immediately; any licences already issued by the .NET server stay valid.
- **B:** generate a new key (e.g. `repasscloud-2026`), add its public key to `trusted_keys.rs`, and ship a CLI release **before** the Worker signs anything with it.

Never commit a private key; it lives only in the Worker secret and an offline backup.

---

## 4. Data model (D1 `repasscloud-licensing`)

Every table has `mode TEXT CHECK(mode IN ('test','live'))` so test and live never mix.

| Table | Key columns |
|---|---|
| `licenses` | `license_id` (`LIC-` + 10 Crockford base32 chars), `mode`, `customer` (name/company), `email`, `status` (`active`/`revoked`/`refunded`), `activation_code_hash`, `issued_at`, `source` (`stripe`/`free`/`admin`/`import`), `order_id`, `metadata_json` |
| `entitlements` | `license_id`, `product` (`cursedelete`), `edition`, `license_type` (`perpetual`/`subscription`/`evaluation`), `seats`, `expires_at` (perpetual uses `9999-12-31T23:59:59.9999999Z`), `updates_until` |
| `activations` | `activation_id` (UUID), `license_id`, `mode` (`online`/`offline`), `device_scheme`, `device_id`, `device_name`, `token_hash` (SHA-256 of `activationToken`), `request_id` (idempotency), `activated_at`, `refresh_after`, `lease_expires_at`, `deactivated_at` |
| `orders` | Stripe `session_id`, `payment_intent`, `email`, `edition`, `amount`, `currency`, `status`, `created_at` |
| `checkout_attempts` | as in how-to-use-ai.com, to reconcile abandoned or delayed sessions |
| `stripe_events` | processed event IDs (idempotency) |
| `reversals` | refund/dispute tombstones, so a refund that arrives before fulfilment still revokes |
| `outbox` | email jobs with leases and retries (`licence-issued`, `order-notice`, `licence-revoked`) |
| `rate_limits` | per-IP and per-licence counters for activation attempts |
| `audit_log` | admin actions and every activation/refresh/deactivate, without secrets |

Constraint: at most one non-deactivated activation per `(mode, license_id)` (partial unique index), matching the CLI's "one active device" rule.

---

## 5. Flows

### 5.1 Paid editions (Business, Enterprise)

1. The edition cards on `/products/cursedelete/#licensing` become a small form: email, optional company name, an **unchecked** "I agree to the Terms of Service and CurseDelete licence terms" box (the legal pack requires it), then submit.
2. `POST /api/licensing/checkout` validates input, rejects if `LICENSING_ENABLED` is false or the mode isn't configured, records a `checkout_attempt`, and creates a Stripe Checkout Session server-side: price from config (never from the client), `metadata {product, edition, attempt_id, mode}`, `customer_email`, promotion codes allowed, success URL `/products/cursedelete/thanks/?session_id={CHECKOUT_SESSION_ID}`. Then 303 redirect to Stripe.
3. `POST /api/stripe/webhook` verifies the `Stripe-Signature` header, checks event mode matches `LICENSING_MODE`, and ignores already-processed event IDs. On `checkout.session.completed` (or `async_payment_succeeded`) it retrieves the session with line items, re-validates price, edition and amount against the attempt, then **in one D1 batch**: order, licence, entitlement, hashed activation code, outbox job.
4. Outbox (cron, every 5 minutes, plus an immediate attempt) sends the **only** email that ever contains the plaintext activation code, via MailerSend from hello@repasscloud.com: licence ID, activation code, the exact `cursdel license activate` command, offline instructions, and links to the licence terms and refund policy.
5. `charge.refunded` / `charge.dispute.created` → mark the licence `refunded`/`revoked`, write a reversal tombstone, and stop accepting refreshes. Existing envelopes keep verifying offline until their lease expires (online), which is the protocol's intended behaviour.
6. Subscriptions (if Business becomes annual): `invoice.paid` extends `entitlements.expires_at`; `customer.subscription.deleted` stops renewal.

The thanks page (static) explains that the licence email is on its way and how to activate. It never shows the activation code, so the Stripe `session_id` in the URL is never a credential.

### 5.2 Free editions (Community, Education)

Community needs no licence at all; the CLI runs at full Community capability without one. Keep the Community card as "Free, no licence needed" with a GitHub link and drop the Stripe link.

Education: `POST /api/licensing/free` with Turnstile, name, institution email and institution name. Two options to decide:

- auto-issue to recognised academic domains (`.edu`, `.edu.au`, `.ac.uk`, …) with a 1-year `evaluation`/`subscription` term, or
- queue for manual approval in the admin view, then issue.

### 5.3 Online activation (CLI → Worker)

`activate`:

1. Bounded body (8 KB), schema validation, `activationToken` must decode to exactly 32 bytes.
2. Rate limit per IP and per `licenseId` (for example, 10 failures per hour per licence, then 429). This is the brute-force guard on activation codes.
3. Constant-time compare of `HMAC(pepper, activationCode)` with the stored hash.
4. Reject revoked or refunded licences (403 Problem) and expired entitlements.
5. If an active activation exists on a different `deviceId`, return 409 "deactivate the other device first". If the same `requestId` was already processed, return the same result (idempotent retry).
6. Store the activation (token stored as SHA-256 hash only). Build the envelope (`deviceBinding` and `activation` both present), canonicalise, sign, and return it with `refreshAfter = now + LEASE_REFRESH_HOURS` and `leaseExpiresAt = now + LEASE_DAYS`.

`validate` / `refresh` / `deactivate`: look up by `activationId`, compare the token hash and `deviceId`, then act. `refresh` re-signs with a new lease. It refuses offline activations (409) and revoked licences.

### 5.4 Offline activation (air-gapped customers)

Customers email `offline-activation-request.json` to hello@repasscloud.com (already the CLI's instruction). The admin view has an "Offline activation" tool: paste or upload the request, and the Worker runs the same activation path with `mode: "offline"` (no lease) and returns a `.license` file to send back. The customer imports it with `cursdel license import`.

### 5.5 Admin

Put `/api/admin/licensing/*` (and a static `/admin/licensing/` page that calls it) behind **Cloudflare Access** (Zero Trust application restricted to danijel@repasscloud.com). The Worker must also verify the `Cf-Access-Jwt-Assertion` JWT against `ACCESS_AUD`, so a misconfigured Access policy fails closed.

Admin functions: search licences by email or ID; view activations; force-deactivate a device; revoke or reinstate; resend the licence email (this generates a **new** activation code, because the old plaintext isn't stored); issue a licence by hand (Enterprise deals, Education approvals); offline activation; import licences from the old .NET server; download an order's details.

---

## 6. Website changes

- `/products/cursedelete/#licensing`: replace the Payment Link buttons with the checkout form and the free/Education flow. Keep the current legal line (Terms, licence terms, Refund, Privacy).
- New static pages: `/products/cursedelete/thanks/`, `/products/cursedelete/activate/` (step-by-step activation help, online and offline), and `/admin/licensing/` (noindex, Access-protected).
- Remove `CURSEDELETE_STRIPE_LINKS` from `src/consts.ts` once checkout is live.
- Add `/admin/` to the sitemap filter and `robots.txt` disallow.
- Privacy Policy: the master policy already covers Stripe, Cloudflare and email providers. Confirm whether the licensing data (device IDs, device names, activation logs, IP addresses used for rate limiting) needs a short **CurseDelete licensing notice**, as the legal pack suggests for tools that add payments and accounts.

---

## 7. CLI changes (cursedelete-2 repo)

1. Default `CURSDEL_LICENSE_SERVER_URL` to `https://repasscloud.com` in release builds; keep the env var override and the localhost dev default for debug builds.
2. If signing-key option B is chosen, add the new public key to `trusted_keys.rs` and release before the Worker uses it.
3. Make `license activate` print a clear "check your purchase email from hello@repasscloud.com" hint on a 401 or 404.
4. Cross-test: activate against the Worker in test mode and confirm `cursdel license status` reports the right edition and `--close-remote-locks` unlocks.

---

## 8. Security checklist

- No secret in the repo, in `[vars]`, or in logs. Logs never include activation codes, tokens, emails or `deviceId`s.
- Activation codes: high entropy (e.g. `XXXXX-XXXXX-XXXXX-XXXXX`, about 100 bits), HMAC with pepper at rest, plaintext only in the issuance email.
- Activation tokens: SHA-256 hash at rest; constant-time comparisons.
- Bounded request bodies, strict JSON schemas, Problem responses without internals.
- Rate limits on activation, free-licence and checkout endpoints. Add a Cloudflare WAF rate-limit rule on `/api/v1/*` as a second layer.
- Stripe: verify signatures, check event mode, re-fetch sessions from Stripe rather than trusting webhook payloads, and keep fulfilment idempotent.
- Test and live data separated by `mode` on every row.
- Key rotation: keep old public keys trusted in the CLI forever so perpetual licences keep verifying; the Worker only ever holds the **current** private key.
- Back up the D1 database (Time Travel is on by default; add a scheduled export if needed).

---

## 9. Testing

- Port `canonical_json.rs` tests, and assert the TypeScript output matches `exhaustive.license` byte for byte.
- Sign an envelope in a test with a generated key, then verify it with the CLI's verifier logic (or run `cursdel license import` in CI against a test-signed file with a test-only trusted key build).
- Unit tests for every endpoint with the fake D1 helper from how-to-use-ai.com.
- Stripe test mode end to end: Checkout → webhook → email → `cursdel license activate` → `refresh` → `deactivate` → activate on a second device → refund → refresh rejected.
- `stripe trigger` and `stripe listen --forward-to` for webhook replay and duplicates.

---

## 10. Rollout

| Phase | Work | Gate |
|---|---|---|
| 0 | Decisions in section 11; signing key exported or new key released in the CLI | Owner sign-off |
| 1 | D1 schema, canonical JSON, signing, activation API with admin-issued licences only | CLI activates against test mode |
| 2 | Admin view behind Access; offline activation; import from the .NET server | Manual licences issued end to end |
| 3 | Stripe checkout and webhook in **test** mode; outbox email | Full test-mode run-through (section 9) |
| 4 | Education/free flow; product page changes; thanks and activate pages | Legal copy reviewed |
| 5 | Live mode: live Stripe prices and webhook, `LICENSING_MODE=live`, `LICENSING_ENABLED=true` | GST/tax treatment confirmed (same gate as how-to-use-ai.com); refund flow tested |
| 6 | Retire the .NET LicenseServer and the Stripe Payment Links | No traffic to the old server for 30 days |

---

## 11. Decisions needed before building

1. **Signing key:** reuse `primary-2026` from the .NET key store (A) or ship a new key in a CLI release first (B).
2. **Pricing model:** are Business ($199 AUD) and Enterprise ($1,499 AUD) perpetual, annual subscriptions, or perpetual with an `updatesUntil` window? Per seat or per organisation (the `seats` field)?
3. **Education:** auto-approve academic domains, or manual approval? Term length?
4. **Community:** confirm "no licence needed" and remove the Community purchase link.
5. **Lease policy:** refresh every 24 hours with a 7-day lease, or longer for CI/build agents (e.g. 7 and 30 days)?
6. **Existing licences:** are there real customers on the .NET server that need importing?
7. **GST:** registration status and invoice treatment (blocks live mode, as on how-to-use-ai.com).
8. **Invoices:** reuse how-to-use-ai.com's PDF invoice module, or rely on Stripe receipts?
9. **Enterprise:** self-serve checkout, or "contact us" with admin-issued licences and invoicing?
