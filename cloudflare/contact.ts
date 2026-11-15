/**
 * Contact form handler: validates a submission from /contact/ and sends it to
 * hello@repasscloud.com through the MailerSend API, with Reply-To set to the
 * visitor's address so replying from the inbox goes straight back to them.
 *
 * Runs on Cloudflare (Pages Function in functions/api/contact.ts, or the
 * Worker entry in cloudflare/worker.ts). Needs one secret:
 *   MAILERSEND_API_KEY  - MailerSend API token with "Email: Full access"
 * Optional plain-text variables:
 *   CONTACT_TO          - recipient (default hello@repasscloud.com)
 *   CONTACT_FROM        - sender on a MailerSend-verified domain (default hello@repasscloud.com)
 *
 * Spam protection, in order: origin check, honeypot, minimum fill time, link
 * and content heuristics, a burst limit (CONTACT_LIMITER binding), a daily
 * limit of 3 sent messages per IP and per email (CONTACT_LIMITS KV namespace),
 * then Cloudflare Turnstile. Turnstile is enforced as
 * soon as the TURNSTILE_SECRET secret exists; the matching public site key is
 * TURNSTILE_SITEKEY in src/consts.ts. Set both together.
 *   TURNSTILE_SECRET    - Turnstile widget secret (secret)
 *   TURNSTILE_HOSTNAMES - comma-separated hostnames siteverify must report
 *                         (default repasscloud.com)
 */

export interface RateLimiter {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
}

export interface KVStore {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expiration?: number }) => Promise<void>;
}

export interface ContactEnv {
  MAILERSEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
  CONTACT_LIMITER?: RateLimiter;
  CONTACT_LIMITS?: KVStore;
}

const DEFAULT_ADDRESS = 'hello@repasscloud.com';
const MAILERSEND_URL = 'https://api.mailersend.com/v1/email';

export const TOPICS: Record<string, string> = {
  products: 'Products and licensing',
  support: 'Product support',
  publishing: 'Books and publishing',
  media: 'Media and press',
  engineering: 'Engineering enquiry',
  careers: 'Careers',
  privacy: 'Privacy or legal',
  other: 'Something else',
};

const LIMITS = { name: 120, email: 254, company: 160, message: 5000, role: 160 };
const MIN_FILL_MS = 4000;
const MAX_LINKS = 2;
const DAILY_LIMIT = 3;
const DAY_SECONDS = 24 * 60 * 60;
const URL_RE = /(?:https?:\/\/|www\.)\S+/gi;
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_ACTION = 'contact';
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

type Fields = Record<string, string>;

interface Result {
  ok: boolean;
  status: number;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function allowedOrigin(origin: string | null, requestUrl: string): boolean {
  // Every current browser sends Origin on a POST, fetch or plain form. Scripts
  // posting straight to the endpoint usually don't, so a missing one is refused.
  if (!origin) return false;
  try {
    const o = new URL(origin);
    const self = new URL(requestUrl);
    return (
      o.host === self.host ||
      o.hostname === 'repasscloud.com' ||
      o.hostname === 'www.repasscloud.com' ||
      o.hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

async function readFields(request: Request): Promise<Fields> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(body).map(([k, v]) => [k, typeof v === 'string' ? v : '']));
  }
  const form = await request.formData();
  const out: Fields = {};
  form.forEach((v, k) => {
    if (typeof v === 'string') out[k] = v;
  });
  return out;
}

const clean = (v: string | undefined, max: number) =>
  (v ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);

const oneLine = (v: string) => v.replace(/[\r\n]+/g, ' ').trim();

const countLinks = (v: string) => (v.match(URL_RE) ?? []).length;

/** Text that people writing to us don't send, but spam nearly always does. */
function looksLikeSpam(name: string, company: string, message: string): boolean {
  if (countLinks(name) || countLinks(company)) return true;
  if (countLinks(message) > MAX_LINKS) return true;
  if (/\[url=|<a\s+href=/i.test(message)) return true;
  // The same character repeated at length (keyboard mashing, filler).
  if (/(.)\1{24,}/.test(message)) return true;
  return false;
}

async function rateLimited(env: ContactEnv, keys: string[]): Promise<boolean> {
  if (!env.CONTACT_LIMITER) return false;
  for (const key of keys) {
    try {
      const { success } = await env.CONTACT_LIMITER.limit({ key });
      if (!success) return true;
    } catch (err) {
      console.error('contact: rate limiter failed', err);
    }
  }
  return false;
}

interface DailyCount {
  count: number;
  expires: number; // unix seconds; the window runs 24 hours from the first message
}

async function readDaily(kv: KVStore, key: string): Promise<DailyCount | null> {
  try {
    const raw = await kv.get(`daily:${key}`);
    if (!raw) return null;
    const v = JSON.parse(raw) as DailyCount;
    return v.expires > Date.now() / 1000 ? v : null;
  } catch (err) {
    console.error('contact: daily limit read failed', err);
    return null;
  }
}

/** True when any key has already sent DAILY_LIMIT messages in its 24-hour window. */
async function overDailyLimit(env: ContactEnv, keys: string[]): Promise<boolean> {
  if (!env.CONTACT_LIMITS) return false;
  const counts = await Promise.all(keys.map((k) => readDaily(env.CONTACT_LIMITS!, k)));
  return counts.some((c) => c !== null && c.count >= DAILY_LIMIT);
}

/** Counts a sent message against each key. */
async function recordDaily(env: ContactEnv, keys: string[]): Promise<void> {
  const kv = env.CONTACT_LIMITS;
  if (!kv) return;
  await Promise.all(
    keys.map(async (k) => {
      const now = Math.floor(Date.now() / 1000);
      const prev = await readDaily(kv, k);
      const next: DailyCount = prev
        ? { count: prev.count + 1, expires: prev.expires }
        : { count: 1, expires: now + DAY_SECONDS };
      // KV needs an expiration at least 60 seconds out.
      try {
        await kv.put(`daily:${k}`, JSON.stringify(next), { expiration: Math.max(next.expires, now + 60) });
      } catch (err) {
        console.error('contact: daily limit write failed', err);
      }
    }),
  );
}

async function turnstileOk(env: ContactEnv, token: string, ip: string): Promise<boolean> {
  if (!token || token.length > 2048) return false;
  const hostnames = new Set(
    (env.TURNSTILE_HOSTNAMES || 'repasscloud.com')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
  );
  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET ?? '', response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch(TURNSTILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body,
    });
    if (!res.ok) throw new Error(`siteverify ${res.status}`);
    const result = (await res.json()) as { success?: boolean; action?: string; hostname?: string; 'error-codes'?: string[] };
    if (result.success === true && result.action === TURNSTILE_ACTION && hostnames.has(result.hostname ?? '')) return true;
    console.warn('contact: turnstile rejected', result['error-codes'], result.action, result.hostname);
    return false;
  } catch (err) {
    console.error('contact: siteverify failed', err);
    return false; // fail closed
  }
}

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function handleContact(request: Request, env: ContactEnv): Promise<Result> {
  if (!allowedOrigin(request.headers.get('origin'), request.url)) {
    return { ok: false, status: 403, error: 'This form can only be sent from repasscloud.com.' };
  }

  let fields: Fields;
  try {
    fields = await readFields(request);
  } catch {
    return { ok: false, status: 400, error: 'The form data could not be read. Please try again.' };
  }

  // Spam traps: a hidden field people never fill in, and a minimum time on page.
  // Bots get a normal-looking success so they don't learn what tripped them.
  const silentDrop: Result = { ok: true, status: 200 };
  if (fields.website) return silentDrop;
  // The page script stamps `started`; a post without it didn't come from the page.
  const started = Number(fields.started);
  if (!Number.isFinite(started) || started <= 0) {
    return {
      ok: false,
      status: 400,
      error: `The form needs JavaScript turned on. You can also email us at ${DEFAULT_ADDRESS}.`,
    };
  }
  if (Date.now() - started < MIN_FILL_MS) return silentDrop;

  const name = oneLine(clean(fields.name, LIMITS.name));
  const email = oneLine(clean(fields.email, LIMITS.email));
  const company = oneLine(clean(fields.company, LIMITS.company));
  const role = oneLine(clean(fields.role, LIMITS.role));
  const message = clean(fields.message, LIMITS.message);
  const topicKey = fields.topic && TOPICS[fields.topic] ? fields.topic : 'other';
  const topic = TOPICS[topicKey];

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = 'Enter your name.';
  if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter an email address we can reply to, like name@example.com.';
  if (message.length < 10) fieldErrors.message = 'Write a message of at least 10 characters.';
  if (Object.keys(fieldErrors).length) {
    return { ok: false, status: 422, error: 'Check the highlighted fields.', fieldErrors };
  }

  if (looksLikeSpam(name, company, message)) {
    console.warn('contact: dropped by content filter');
    return silentDrop;
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const limitKeys = [`ip:${ip || 'unknown'}`, `email:${email.toLowerCase()}`];
  if (await overDailyLimit(env, limitKeys)) {
    return {
      ok: false,
      status: 429,
      error: `You've already sent ${DAILY_LIMIT} messages today. Wait another day and try again.`,
    };
  }
  if (await rateLimited(env, limitKeys)) {
    return {
      ok: false,
      status: 429,
      error: `You've sent several messages in a short time. Wait a few minutes, or email ${DEFAULT_ADDRESS}.`,
    };
  }

  if (env.TURNSTILE_SECRET && !(await turnstileOk(env, fields['cf-turnstile-response'] ?? '', ip))) {
    return {
      ok: false,
      status: 403,
      error: `We couldn't confirm you're not a bot. Complete the check and send again, or email ${DEFAULT_ADDRESS}.`,
    };
  }

  if (!env.MAILERSEND_API_KEY) {
    console.error('contact: MAILERSEND_API_KEY is not set');
    return {
      ok: false,
      status: 503,
      error: `The contact form isn't available right now. Email us at ${DEFAULT_ADDRESS} instead.`,
    };
  }

  const to = env.CONTACT_TO || DEFAULT_ADDRESS;
  const from = env.CONTACT_FROM || DEFAULT_ADDRESS;
  const subject = `[repasscloud.com] ${topic}${role ? ` (${role})` : ''}: ${name}`.slice(0, 200);
  const sentAt = new Date().toISOString();
  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Company', company || '-'],
    ['Topic', topic],
    ...(role ? ([['Role', role]] as [string, string][]) : []),
    ['Sent', sentAt],
  ];

  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${message}\n`;
  const html = `<table cellpadding="4" style="font:14px/1.5 sans-serif;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="color:#4f4a5c;padding-right:16px">${k}</td><td>${escapeHtml(v)}</td></tr>`)
    .join('')}</table><hr style="border:0;border-top:1px solid #e3e0ea;margin:16px 0"><div style="font:15px/1.6 sans-serif;white-space:pre-wrap">${escapeHtml(message)}</div>`;

  const payload = {
    from: { email: from, name: 'RePass Cloud website' },
    to: [{ email: to, name: 'RePass Cloud' }],
    reply_to: { email, name },
    subject,
    text,
    html,
    tags: ['website-contact', topicKey],
  };

  let res: Response;
  try {
    res = await fetch(MAILERSEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.MAILERSEND_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('contact: MailerSend request failed', err);
    return { ok: false, status: 502, error: `Your message couldn't be sent. Try again, or email ${DEFAULT_ADDRESS}.` };
  }

  if (res.status === 202 || res.ok) {
    await recordDaily(env, limitKeys);
    return { ok: true, status: 200 };
  }

  console.error('contact: MailerSend error', res.status, await res.text().catch(() => ''));
  return { ok: false, status: 502, error: `Your message couldn't be sent. Try again, or email ${DEFAULT_ADDRESS}.` };
}

/** Turns a handler result into a response: JSON for fetch() callers, a redirect for plain form posts. */
export function toResponse(request: Request, result: Result): Response {
  const wantsJson =
    (request.headers.get('accept') ?? '').includes('application/json') ||
    (request.headers.get('content-type') ?? '').includes('application/json');

  if (wantsJson) {
    return new Response(
      JSON.stringify({ ok: result.ok, error: result.error, fieldErrors: result.fieldErrors }),
      {
        status: result.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      },
    );
  }

  const back = new URL('/contact/', request.url);
  back.searchParams.set(result.ok ? 'sent' : 'error', '1');
  return Response.redirect(back.toString(), 303);
}

export async function contactEndpoint(request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  return toResponse(request, await handleContact(request, env));
}
