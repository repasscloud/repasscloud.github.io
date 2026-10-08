// Checks the built site in dist/ for the basics search engines report on:
// title and meta description length, canonical URL, one <h1>, image alt text,
// and internal links that don't resolve to a built page, file or redirect.
// Run after a build: npm run build && node script/check-seo.mjs
// Exits non-zero on errors. Length issues are warnings.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://repasscloud.com';

const TITLE = [30, 65];
const DESC = [110, 165];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const redirects = existsSync(join(dist, '_redirects'))
  ? readFileSync(join(dist, '_redirects'), 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => l.split(/\s+/)[0])
  : [];

function resolves(path) {
  const clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return true;
  if (clean.startsWith('/api/')) return true;
  const candidates = [join(dist, clean), join(dist, clean, 'index.html'), join(dist, `${clean}.html`)];
  if (candidates.some((c) => existsSync(c) && statSync(c).isFile())) return true;
  return redirects.some((r) =>
    r.endsWith('*') ? clean.startsWith(r.slice(0, -1)) : r === clean || r === clean.replace(/\/$/, ''),
  );
}

const attr = (html, re) => html.match(re)?.[1]?.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

let errors = 0;
let warnings = 0;
const pages = walk(dist).filter((f) => f.endsWith('.html'));

for (const file of pages) {
  const rel = '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\.html$/, '/');
  const html = readFileSync(file, 'utf8');
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const issues = [];
  const warn = (m) => {
    issues.push(`  warn  ${m}`);
    warnings++;
  };
  const fail = (m) => {
    issues.push(`  ERROR ${m}`);
    errors++;
  };

  const title = attr(html, /<title>([^<]*)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);

  if (!noindex) {
    if (!title) fail('missing <title>');
    else if (title.length < TITLE[0] || title.length > TITLE[1]) warn(`title is ${title.length} chars: "${title}"`);
    if (!desc) fail('missing meta description');
    else if (desc.length < DESC[0] || desc.length > DESC[1]) warn(`description is ${desc.length} chars`);
    if (!canonical) fail('missing canonical');
    else if (!canonical.startsWith(`${SITE}/`)) fail(`canonical not on ${SITE}: ${canonical}`);
    const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1s !== 1) warn(`${h1s} <h1> elements`);
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) fail(`img without alt: ${m[0].slice(0, 90)}`);
  }

  for (const m of html.matchAll(/\shref="(\/[^"]*)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (href.startsWith('//')) continue;
    if (!resolves(href)) fail(`broken internal link: ${href}`);
  }

  if (issues.length) console.log(`${rel}\n${issues.join('\n')}`);
}

console.log(`\nChecked ${pages.length} pages: ${errors} errors, ${warnings} warnings.`);
process.exit(errors ? 1 : 0);
