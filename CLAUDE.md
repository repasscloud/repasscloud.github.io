# CLAUDE.md

## Repository Context

This repository contains the source code for the public RePass Cloud website at `https://repasscloud.com`.

The current active site is an Astro static site hosted on **Cloudflare** (it used to be GitHub Pages; it no longer is). Some legacy Hugo files still exist in the repository, including `hugo.toml`, `layouts/`, `content/`, `static/`, `themes/`, and the Gokarna theme submodule. Treat those as legacy unless the task explicitly asks for Hugo migration or cleanup.

Primary stack:

- Astro 7
- TypeScript / Astro components
- MD / MDX content collections (`posts`, `jobs`)
- Cloudflare hosting: static `dist/` plus one function (`/api/contact`)
- GitHub Actions build pipeline (`dev` → `main`)
- Tectonic for compiling `.tex` files into PDFs before the Astro build

## Operating Rule

Maintain the live Astro site. Do not convert the project back to Hugo. Do not assume Hugo files are active source-of-truth unless specifically asked.

**Positioning (2026 refresh):** RePass Cloud is an Australian software company **and publisher**. It designs, builds, owns and operates software products (CurseDelete 2, Cinturon360, Aethon Jobs) and publishes the How-To-Use-AI.com book series (author Danijel-James Wynyard-McClay). Products and publishing get first-class navigation and homepage presence. Enterprise engineering (platforms, cloud governance, Microsoft 365 identity, PowerShell) lives on one `/engineering/` page as credibility and SEO content, secondary to the product/publishing identity. `docs/REPASSCLOUD-SITE-REBUILD-CLAUDE-PROMPT.md` is the earlier rebuild brief; `design-review/` (untracked, if present) holds the mockups the 2026 visual refresh was chosen from (Option A "Spectrum", with Option B's bookshelf on Publishing).

Prefer small, reviewable updates. Do not reintroduce a services-first/engagement-funnel framing (see "Contact and CTA philosophy").

## Design system

- `src/styles/site.css` is the only global stylesheet (the old `revamp.css` is gone). Tokens are at the top, with contrast ratios noted.
- Everyday UI is ink `#18141F` on white, with violet `#6A1FC4` as the single action colour and magenta `#C2186F` for highlights. The brand spectrum (gold `#FFBE16` → pink `#E35F9A` → purple `#AB2DF3`) is a signature only: the logo, the 4px rule at the top of every page (`body::before`), and artwork. Never use pink `#E35F9A` for text (3.3:1).
- Typeface: Schibsted Grotesk, self-hosted through Astro's fonts API (`astro.config.mjs` → `--font-sans`, loaded by `<Font>` in `BaseHead.astro`). No Google Fonts `<link>`, no Bootstrap Icons. Use inline SVG for any icon that carries meaning.
- Reusable classes: `.wrap`, `.wrap-narrow`, `.section`, `.section-sm`, `.band`, `.ink-band`, `.page-hero`, `.sec-head`, `.split`, `.split-wide`, `.panel`, `.rows`, `.caps` (definition grid), `.outcomes`, `.news-list`, `.facts`, `.kv`, `.data-table`, `.terminal`, `.prose`, `.form`/`.field`, `.btn` + `.btn-primary`/`.btn-quiet`/`.btn-on-ink`, `.tag`, `.kicker`, `.breadcrumb`. Use these before writing page-scoped CSS.
- Avoid identical card grids with icons on every card, centred eyebrow labels on every section, and gradient washes. Give each section its own weight.

## Brand assets

- `public/brand/*.svg` are the source logo files: mark (`repasscloud-mark.svg`, plus black/white), horizontal lockup (`repasscloud-logo.svg`, `-white`), wordmark. The wordmark is outlined to paths.
- `node script/generate-brand-assets.mjs` (`npm run brand`) renders PNGs into `public/brand/png/` (mark up to 4096 px, lockup up to 4800 px) and the favicon set (`favicon.ico`, `favicon.svg`, `favicon-16/32`, `apple-touch-icon.png`, `android-chrome-*`).
- `script/generate-brand-svgs.mjs` rebuilds the SVGs themselves (needs `npm i --no-save opentype.js@1.3.4`); only needed if the mark geometry changes. Fonts for scripts are vendored in `script/fonts/` (SIL OFL).
- `node script/generate-og-images.mjs` (also needs opentype.js) renders `public/img/og-default.png`, `og-cursedelete.png`, `og-engineering.png` and `og-publishing.png` (which composites the Book 1 cover).
- `/brand/` is the public press page with downloads.

## Important Files

### Site configuration

- `package.json`: Node `>=22.12.0`. Scripts: `dev`, `build`, `preview`, `check` (astro check), `check:seo` (see SEO), `brand`.
- `astro.config.mjs`: `site` is `https://repasscloud.com`; MDX and sitemap integrations; Schibsted Grotesk via `fontProviders.google()`; ignores `themes/**` for Vite watching (circular symlink in the old Hugo theme).
- `src/consts.ts`: site title (`SITE_TITLE`), homepage title (`HOME_TITLE`, kept 50-60 chars), description, company legal name/ABN, contact email, product/social URLs, OG image paths, brand paths, GTM/GA IDs.
  - `CURSEDELETE_STRIPE_LINKS` holds one Stripe-hosted purchase link per edition. These are Stripe **test-mode** links (`buy.stripe.com/test_...`); swap for live-mode links before real launch. Never fabricate a purchase URL.
  - `CURSEDELETE_VERSION` is a static string; update by hand on release.
- `src/data/products.ts`: `products` (active) and `archiveProjects` (retired). Products use `monogram` + `colour` + `kind`, or `iconImage` for real art, plus optional `version`/`changelogUrl`. Used by the homepage, `/products/`, `/about/` and the footer.
- `src/data/books.ts`: the How-To-Use-AI.com series (`SERIES`, `books`). Source of truth for book data is `publishing/books.json` in the how-to-use-ai.com repository (titles, ISBNs, accent colours, back-cover copy); copy changes across by hand. Kindle store links come from `https://how-to-use-ai.com/purchase/` (ASIN `B0HLYQSMQT`). Direct digital purchase links go to that purchase page, which gets direct links on release day. A book gets its own page when `page: true`.
- `src/data/engineering.ts`: the four capabilities (with anchor ids) and selected outcomes, used by the homepage and `/engineering/`.
- `src/components/Changelog.astro`: fetches and renders a Keep a Changelog `CHANGELOG.md` at build time; renders nothing if the fetch fails.

### Layouts and shell

- `src/layouts/Layout.astro`: document wrapper (`lang="en-AU"`), skip link target `#main`, header, footer, cookie banner, GTM noscript. Props: `title`, `description`, `exactTitle`, `ogImagePath`, `ogImageAlt`, `noIndex`, `canonical`, etc.
- `src/components/BaseHead.astro`: canonical, titles, descriptions, robots, OG/Twitter, favicons/manifest, RSS, sitemap link, fonts, GA/GTM with consent default denied. Title rule: `title === SITE_TITLE` → `HOME_TITLE`; `exactTitle` → verbatim; otherwise `"<title> | RePass Cloud"` unless that exceeds 65 characters, in which case the bare title is used.
- `src/layouts/PostLayout.astro`: news articles, `BlogPosting` + `BreadcrumbList` schema.
- `src/layouts/ProsePageLayout.astro`: markdown pages under `src/pages/legal/` and `src/pages/careers/`. Front matter: `title`, `description`, optional `seoTitle` (full `<title>`, used verbatim) and `noIndex`.

### Navigation and footer

- `src/components/Header.astro`: Products, Publishing, Engineering, News, Company (`/about/`), Contact. Active state uses `currentPath.startsWith(href)` on trailing-slash paths. Mobile menu uses `hidden` + `aria-expanded`, closes on Escape (returns focus to the toggle), outside click, link click and resize to desktop.
- `src/components/Footer.astro`: columns Products (from `products.ts`), Publishing (from `books.ts`), Company, Elsewhere; legal row with ABN, policy links and the CCPA "Your privacy choices" button (must stay on every page). No CTA banners.

### Pages

- `/` (`src/pages/index.astro`): hero with the Book 1 cover and a real `cursdel` dry run → Software and Publishing panels → engineering capabilities → selected work → news. `Organization` + `WebSite` schema.
- `/products/`, `/products/cursedelete/`: product catalogue (`ItemList` schema) and the CurseDelete 2 page (content verifiable from the `repasscloud/cursedelete-2` repo only; `SoftwareApplication` + `BreadcrumbList` schema, no `Offer`/ratings). The CLI binary is `cursdel`.
- `/publishing/` (`BookSeries` schema, `BookShelf` component: Book 1 face-out with its real cover, later books as spines in their `books.json` accent colours) and `/publishing/<slug>/` (`Book` schema with an edition per ISBN; Kindle store list; direct purchase via how-to-use-ai.com).
- `/engineering/`: merged former `/services/*` and `/case-studies` pages.
- `/careers/`: see "Careers".
- `/contact/`: see "Contact form".
- `/about/`, `/news/`, `/news/<slug>/`, `/archive/`, `/legal/`, `/brand/`, `404` (the animated space 404 was deliberately restored; keep it).
- Content collection `posts` (`src/content/posts/`) renders under `/news/<slug>/`; the collection name stays `posts` internally. `src/pages/rss.xml.js` builds the feed.

## Careers (dynamic job ads)

- Job ads are the `jobs` content collection: one markdown file per role in `src/content/jobs/`. Schema in `src/content.config.ts`; copy `src/content/jobs/_TEMPLATE.md` (files starting with `_` are ignored).
- `src/lib/jobs.ts` → `getOpenJobs()` returns roles that are not `draft` and whose `closes` date hasn't passed at build time.
- `/careers/` lists open roles, or shows "No jobs currently open" when there are none. Each open role gets `/careers/jobs/<file-name>/` with `JobPosting` structured data. Apply defaults to `/contact/?topic=careers&role=<title>`; set `apply` to an email or URL to override.
- To take a role down: set `draft: true` or delete the file, then rebuild.
- Supporting pages (`how-we-hire`, `culture`, `candidate-guide`, `equal-opportunity`, `applicant-privacy-notice`) are markdown under `src/pages/careers/`.

## Contact form

- `/contact/` posts to `/api/contact` (JSON via fetch, or a plain form post without JavaScript, which redirects back with `?sent=1` / `?error=1`). `?topic=` preselects a topic; `?role=` is passed through for careers.
- Logic: `cloudflare/contact.ts`. Pages entry: `functions/api/contact.ts`. Workers entry (if deployed with `wrangler deploy`): `cloudflare/worker.ts` via `wrangler.toml` (`main`, `[assets] binding = "ASSETS"`, `run_worker_first = ["/api/*"]`). Cloudflare Pages ignores `wrangler.toml` because it has no `pages_build_output_dir`.
- Sends through the MailerSend API from `hello@repasscloud.com` to `hello@repasscloud.com`, with `reply_to` set to the visitor's address. Secret: `MAILERSEND_API_KEY` (never commit it). Optional vars `CONTACT_TO`, `CONTACT_FROM`. Without the key the endpoint returns 503 and the page tells people to email instead.
- Spam controls: honeypot field `website`, minimum fill time (`started`), origin check, server-side validation, header-injection-safe subject. For more, add a Cloudflare rate-limiting rule on `/api/contact` or Turnstile.

## URL changes and redirects

Treat indexed URLs as a public API. Cloudflare serves real **301 redirects** from `public/_redirects` (copied to `dist/`). When a page moves or is removed, add a rule there (with and without trailing slash for exact paths; specific rules before splats) rather than leaving a broken URL. Current rules cover `/posts/*` → `/news/*` (including the "mialboxes" slug typo), `/projects` → `/archive/`, `/services/*` and `/case-studies` → `/engineering/#…`, `/careers/jobs/` → `/careers/`, `/tags/*`, and `/books`, `/press` aliases. The old meta-refresh `RedirectPage` pattern and `src/data/newsRedirects.ts` are gone.

`public/_headers` sets HSTS and security headers. HTTP → HTTPS and `www` → apex must be enforced in the Cloudflare dashboard (SSL/TLS → Edge Certificates → **Always Use HTTPS**; a redirect rule for `www`), not in this repo.

## Contact and CTA philosophy

Contact stays low-key: one nav item, footer links, and at most one restrained text link on a page. Do not add full-width "Start a conversation"/"Book a call" banners, repeated CTA buttons, floating contact buttons or modal lead forms. Product and book pages use product-specific actions (Editions and licensing, Source on GitHub, Pre-order on Kindle, Buy direct).

## Content Editing Rules

- Tone: direct, technical, calm, credible. No hype words ("revolutionary", "world-class", "unlock", "empower", "transform", "cutting-edge").
- Australian English. Sentence case. Plain verbs.
- Never invent metrics, client names, testimonials, counts, prices, certifications or book details. Only state what is verifiable from this repo, the relevant product repo, or the how-to-use-ai.com `books.json`/purchase page.
- Blog posts in `src/content/posts/` need `title`, `description` (aim for 120-160 characters), `pubDate`; optional `updatedDate`, `heroImage`, `tags`. Keep `pubDate` stable; add `updatedDate` for substantial revisions.

## SEO Rules

- Every page needs a useful `<title>` (aim 50-60 characters; use `exactTitle` when the page title already reads well with the brand) and a unique meta description of 120-160 characters. Bing Webmaster Tools flags short titles and short descriptions.
- Run `npm run build && npm run check:seo`. `script/check-seo.mjs` reports title/description length, missing canonicals, `<h1>` count, images without `alt`, and internal links that don't resolve to a page, file or `_redirects` rule. It exits non-zero on errors; length issues are warnings.
- Canonicals come from `BaseHead.astro` and always use `https://repasscloud.com`.
- `robots.txt` points at `https://repasscloud.com/sitemap-index.xml`.
- External links use `target="_blank" rel="noopener"` and a trailing ↗.

## Analytics and Consent Rules

- Do not bypass the consent default of denied analytics storage (`BaseHead.astro`).
- Do not add analytics scripts to pages directly.
- Preserve the cookie banner (`CookieConsent.astro`) and keep the footer "Your privacy choices" button calling `window.repasscloudOpenCookieBanner()`.

## Legal and Privacy Pages

Legal markdown lives in `src/pages/legal/`. Do not invent legal obligations or change legal wording unless asked; front-matter `description`/`seoTitle` are metadata and may be tuned for SEO. PDFs compiled from `latex/` are published from `public/downloads/legal/`.

## LaTeX / PDF Publishing

CI compiles `.tex` files from `latex/` into the matching path under `public/` (Astro serves `public/`; it used to write to `static/`, which was never served). Keep `.tex` source under `latex/`. Commit regenerated PDFs under `public/downloads/` so the Cloudflare build (which doesn't run Tectonic) serves them.

## Branching and Deployment Workflow

1. Work from `dev` (or a feature branch merged into `dev`).
2. Run `npm run check`, `npm run build` and `npm run check:seo` before committing.
3. Push to `dev`. `.github/workflows/astro-build.yml` builds and auto-merges `dev` → `main`; Cloudflare deploys `main`.

Do not push directly to `main` unless explicitly instructed. Do not alter the auto-merge workflow casually.

## Code Style

- Small, readable Astro components; constants and data arrays for repeated content.
- Semantic HTML; preserve accessibility attributes and keyboard handling.
- Avoid client-side JavaScript unless needed (current uses: mobile nav, cookie consent, contact form enhancement, 404 animation).
- Two-space indentation. Don't reformat whole files for small edits.
- In Astro templates, text followed by a line break and then `{expression}` or an inline element can lose its space; use `{' '}` at the end of the line.

## Accessibility Checks

Images have useful `alt` (decorative images `alt=""`); buttons have accessible names; mobile nav opens/closes with keyboard and Escape; visible focus (`:focus-visible` violet outline); contrast at WCAG AA; reduced motion respected (global rule in `site.css`).

## Security and Dependency Rules

- No secrets in the repo. `MAILERSEND_API_KEY` is a Cloudflare secret.
- Use `set:html` only for trusted JSON-LD or controlled markup.
- Don't add third-party scripts without a clear reason and consent implications.
- If `npm audit` reports issues, prefer minimal updates and verify the build.

## Known Issues / Review Items

1. `deploy.sh` still builds with Hugo; legacy.
2. Legacy Hugo folders remain. Clean up only after confirming nothing under `static/` is still needed.
3. CI uses Node 25 while `package.json` allows `>=22.12.0`.
4. `CURSEDELETE_STRIPE_LINKS` are Stripe test-mode links.
5. The privacy policy (section 8) says "We do not use Google Analytics", but the site loads GA4/GTM behind the consent banner. One of them needs to change; legal wording was not edited.
6. Company location: the old site said Sydney; the book publisher address in `books.json` is in South Australia. New copy says "Australia" only. Confirm before adding a city to schema or copy.
7. Several older posts have titles over 60 characters or descriptions over 160 (`npm run check:seo` lists them).
