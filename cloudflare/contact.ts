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
 */

export interface ContactEnv {
  MAILERSEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
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
const MIN_FILL_MS = 2500;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

type Fields = Record<string, string>;

interface Result {
  ok: boolean;
  status: number;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function allowedOrigin(origin: string | null, requestUrl: string): boolean {
  if (!origin) return true; // same-origin form posts from some browsers omit it
  try {
    const o = new URL(origin);
    const self = new URL(requestUrl);
    return (
      o.host === self.host ||
      o.hostname === 'repasscloud.com' ||
      o.hostname === 'www.repasscloud.com' ||
      o.hostname.endsWith('.pages.dev') ||
      o.hostname.endsWith('.workers.dev') ||
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
  if (fields.website) return { ok: true, status: 200 };
  const started = Number(fields.started);
  if (Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS) {
    return { ok: true, status: 200 };
  }

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

  if (res.status === 202 || res.ok) return { ok: true, status: 200 };

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
