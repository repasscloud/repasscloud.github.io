// Generates the LinkedIn covers in the same style as the X header:
//   1128x191 for the company page, 1584x396 for the personal profile.
//   npm i --no-save opentype.js@1.3.4 && node script/generate-linkedin-banner.mjs
// LinkedIn overlaps the bottom-left with the logo or profile photo and trims the
// sides on mobile, so copy starts right of the avatar and the book sits inset.

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

const products = 'CurseDelete 2 · Cinturon360 · Aethon Jobs · How-To-Use-AI.com';

const banners = [
  {
    file: 'repasscloud-linkedin-company-1128x191.png',
    W: 1128,
    H: 191,
    rule: 4,
    coverH: 140,
    coverRight: 56,
    blur: 8,
    copy: (x) => `
  ${text('Software and books, made in Australia.', x, 86, 34, 800, '#FFFFFF', -0.8)}
  ${text(products, x + 1, 117, 14, 600, '#C9C4D3')}
  ${text('repasscloud.com', x + 1, 143, 14, 600, '#9B94A8')}`,
    x: 230,
  },
  {
    file: 'repasscloud-linkedin-profile-1584x396.png',
    W: 1584,
    H: 396,
    rule: 6,
    coverH: 260,
    coverRight: 110,
    blur: 14,
    copy: (x) => `
  ${text('Software and books,', x, 150, 58, 800, '#FFFFFF', -1.3)}
  ${text('made in Australia.', x, 215, 58, 800, '#FFFFFF', -1.3)}
  ${text(products, x + 2, 264, 19, 600, '#C9C4D3')}
  ${text('repasscloud.com', x + 2, 304, 20, 600, '#9B94A8')}`,
    x: 440,
  },
];

for (const { file, W, H, rule, coverH, coverRight, blur, copy, x } of banners) {
  const base = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFBE16"/><stop offset=".5" stop-color="#E35F9A"/><stop offset="1" stop-color="#AB2DF3"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#18141F"/>
  <rect y="${H - rule}" width="${W}" height="${rule}" fill="url(#spectrum)"/>
  ${copy(x)}
</svg>`;

  const cover = await sharp(join(root, 'src', 'assets', 'books', 'book-01-cover.jpg'))
    .resize({ height: coverH })
    .jpeg({ quality: 92 })
    .toBuffer();
  const { width: coverW } = await sharp(cover).metadata();
  const left = W - coverW - coverRight;
  const top = Math.round((H - rule - coverH) / 2);
  const pad = blur * 3;
  const shadow = Buffer.from(
    `<svg width="${coverW + pad * 2}" height="${coverH + pad * 2}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="b"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><rect x="${pad}" y="${pad + blur / 2}" width="${coverW}" height="${coverH}" fill="#000" opacity=".6" filter="url(#b)"/></svg>`,
  );

  await sharp(Buffer.from(base))
    .composite([
      { input: shadow, left: left - pad, top: top - pad },
      { input: cover, left, top },
    ])
    .png()
    .toFile(join(root, 'public', 'brand', 'png', file));
  console.log(`Wrote public/brand/png/${file}`);
}
