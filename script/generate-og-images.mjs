// Generates branded 1200x630 Open Graph images using sharp.
// Run with: node script/generate-og-images.mjs
// Re-run any time the brand, copy or book cover changes; outputs are static
// files committed under public/img/. Text is set in Schibsted Grotesk from
// script/fonts/, outlined to paths so output matches the site.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const fontDir = join(here, 'fonts');
// sharp's SVG renderer can't load custom fonts on every platform, so text is
// outlined to paths with opentype.js (not a project dependency):
//   npm i --no-save opentype.js@1.3.4 && node script/generate-og-images.mjs
const { default: opentype } = await import('opentype.js');
const fonts = Object.fromEntries(
  [400, 600, 700, 800].map((w) => [w, opentype.loadSync(join(fontDir, `SchibstedGrotesk-${w}.ttf`))]),
);
function text(str, x, y, size, weight, fill, tracking = 0) {
  const font = fonts[weight];
  const glyphs = font.stringToGlyphs(str);
  let cx = x;
  let d = '';
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, size).toPathData(2);
    cx += (g.advanceWidth * size) / font.unitsPerEm + tracking;
    if (i < glyphs.length - 1) cx += (font.getKerningValue(g, glyphs[i + 1]) * size) / font.unitsPerEm;
  });
  return `<path d="${d}" fill="${fill}"/>`;
}

const { default: sharp } = await import('sharp');

const outDir = join(root, 'public', 'img');
const W = 1200;
const H = 630;

const markSvg = readFileSync(join(root, 'public', 'brand', 'repasscloud-mark.svg'), 'utf8');
const markInner = markSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>.*?<\/title>/, '');


function card({ title, lines, kicker, size }) {
  const titleSize = size ?? (title.length > 18 ? 76 : 92);
  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFBE16"/><stop offset=".5" stop-color="#E35F9A"/><stop offset="1" stop-color="#AB2DF3"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#18141F"/>
  <rect width="${W}" height="8" fill="url(#spectrum)"/>
  <g transform="translate(80 72) scale(0.125)">${markInner}</g>
  ${text('RePass Cloud', 156, 113, 30, 700, '#FFFFFF')}
  ${kicker ? text(kicker, 80, 290, 28, 600, '#E35F9A') : ''}
  ${text(title, 76, kicker ? 380 : 360, titleSize, 800, '#FFFFFF', -2)}
  ${lines
    .map(
      (l, i) =>
        text(l, 80, (kicker ? 440 : 420) + i * 42, 30, 400, '#C9C4D3'),
    )
    .join('')}
  ${text('repasscloud.com', 80, 574, 24, 600, '#9B94A8')}
</svg>`;
}

const cards = [
  {
    file: 'og-default.png',
    title: 'RePass Cloud',
    lines: ['Australian software company and publisher.', 'Products we build and run, and the How-To-Use-AI.com books.'],
  },
  {
    file: 'og-cursedelete.png',
    kicker: 'Product',
    title: 'CurseDelete 2',
    lines: ['A native Rust deletion engine for directory trees', 'that refuse to die. macOS, Windows and Linux.'],
  },
  {
    file: 'og-engineering.png',
    kicker: 'Engineering',
    title: 'Enterprise engineering',
    lines: ['Identity automation, cloud governance and platform', 'work built to hold up in production.'],
  },
];

for (const c of cards) {
  const out = join(outDir, c.file);
  await sharp(Buffer.from(card(c))).png().toFile(out);
  console.log(`Wrote public/img/${c.file}`);
}

// Publishing card: copy on the left, Book 1 cover on the right.
{
  const coverPath = join(root, 'src', 'assets', 'books', 'book-01-cover.jpg');
  const coverH = 470;
  const cover = await sharp(coverPath).resize({ height: coverH }).jpeg({ quality: 90 }).toBuffer();
  const { width: coverW } = await sharp(cover).metadata();
  const base = card({
    kicker: 'Publishing',
    title: 'How-To-Use-AI.com',
    size: 54,
    lines: ['Book 1: AI for Normal People.', 'Out 29 October 2026.'],
  });
  const shadow = Buffer.from(
    `<svg width="${coverW + 80}" height="${coverH + 80}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="b"><feGaussianBlur stdDeviation="18"/></filter></defs><rect x="40" y="50" width="${coverW}" height="${coverH}" fill="#000" opacity=".55" filter="url(#b)"/></svg>`,
  );
  const left = W - coverW - 80;
  const top = Math.round((H - coverH) / 2) + 10;
  await sharp(Buffer.from(base))
    .composite([
      { input: shadow, left: left - 40, top: top - 40 },
      { input: cover, left, top },
    ])
    .png()
    .toFile(join(outDir, 'og-publishing.png'));
  console.log('Wrote public/img/og-publishing.png');
}
