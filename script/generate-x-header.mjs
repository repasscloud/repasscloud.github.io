// Generates the 1500x500 profile header for the official X (Twitter) account.
//   npm i --no-save opentype.js@1.3.4 && node script/generate-x-header.mjs
// X overlaps the bottom-left with the profile picture and crops the top and
// bottom on mobile, so copy starts right of the avatar and stays mid-height.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const { default: opentype } = await import('opentype.js');
const { default: sharp } = await import('sharp');
const fonts = Object.fromEntries(
  [400, 600, 800].map((w) => [w, opentype.loadSync(join(here, 'fonts', `SchibstedGrotesk-${w}.ttf`))]),
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

const W = 1500;
const H = 500;
const x = 400;

const base = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFBE16"/><stop offset=".5" stop-color="#E35F9A"/><stop offset="1" stop-color="#AB2DF3"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#18141F"/>
  <rect y="${H - 8}" width="${W}" height="8" fill="url(#spectrum)"/>
  ${text('Software and books,', x, 196, 66, 800, '#FFFFFF', -1.5)}
  ${text('made in Australia.', x, 270, 66, 800, '#FFFFFF', -1.5)}
  ${text('CurseDelete 2 · Cinturon360 · Aethon Jobs · How-To-Use-AI.com', x + 2, 326, 21, 600, '#C9C4D3')}
  ${text('repasscloud.com', x + 2, 372, 22, 600, '#9B94A8')}
</svg>`;

const coverH = 310;
const cover = await sharp(join(root, 'src', 'assets', 'books', 'book-01-cover.jpg'))
  .resize({ height: coverH })
  .jpeg({ quality: 92 })
  .toBuffer();
const { width: coverW } = await sharp(cover).metadata();
const left = W - coverW - 100;
const top = Math.round((H - coverH) / 2);
const shadow = Buffer.from(
  `<svg width="${coverW + 80}" height="${coverH + 80}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="b"><feGaussianBlur stdDeviation="16"/></filter></defs><rect x="40" y="50" width="${coverW}" height="${coverH}" fill="#000" opacity=".6" filter="url(#b)"/></svg>`,
);

const out = join(root, 'public', 'brand', 'png', 'repasscloud-x-header-1500x500.png');
await sharp(Buffer.from(base))
  .composite([
    { input: shadow, left: left - 40, top: top - 40 },
    { input: cover, left, top },
  ])
  .png()
  .toFile(out);
console.log('Wrote public/brand/png/repasscloud-x-header-1500x500.png');
