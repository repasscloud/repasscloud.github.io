// Generates the Google Play Console developer page images:
//   - developer icon, 512 x 512, opaque 24-bit PNG
//   - header image, 4096 x 2304, opaque 24-bit PNG (falls back to JPEG if over 1 MB)
//   npm i --no-save opentype.js@1.3.4 && node script/generate-play-assets.mjs
// Play crops the header differently on phones and desktop, so the logo and
// tagline sit in the centre third with generous margins.

import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const { default: opentype } = await import('opentype.js');
const { default: sharp } = await import('sharp');
const outDir = join(root, 'public', 'brand', 'png');
const MAX_BYTES = 1024 * 1024;

const fonts = Object.fromEntries(
  [600, 800].map((w) => [w, opentype.loadSync(join(here, 'fonts', `SchibstedGrotesk-${w}.ttf`))]),
);
function textPath(str, size, weight, tracking = 0) {
  const font = fonts[weight];
  const glyphs = font.stringToGlyphs(str);
  let cx = 0;
  let d = '';
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, 0, size).toPathData(2);
    cx += (g.advanceWidth * size) / font.unitsPerEm + tracking;
    if (i < glyphs.length - 1) cx += (font.getKerningValue(g, glyphs[i + 1]) * size) / font.unitsPerEm;
  });
  return { d, width: cx };
}
function centredText(str, cx, y, size, weight, fill, tracking = 0) {
  const { d, width } = textPath(str, size, weight, tracking);
  return `<path transform="translate(${(cx - width / 2).toFixed(1)} ${y})" d="${d}" fill="${fill}"/>`;
}

const spectrum = (id, x1, y1, x2, y2, units = 'objectBoundingBox') =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="${units}">
    <stop offset="0" stop-color="#FFBE16"/><stop offset=".5" stop-color="#E35F9A"/><stop offset="1" stop-color="#AB2DF3"/>
  </linearGradient>`;

// The glyph inside the mark (white ring, dot and arrow), in 512-unit space.
const glyph = `
  <path d="M317.46 164.58A116 116 0 1 0 368.97 314.18" fill="none" stroke="#FFFFFF" stroke-width="50"/>
  <circle cx="368.97" cy="314.18" r="25" fill="#FFFFFF"/>
  <path d="M346.57 109.84L288.35 219.32L382.8 199.32Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="10" stroke-linejoin="round"/>`;

async function write(svg, w, h, name) {
  const png = await sharp(Buffer.from(svg), { density: 72 })
    .resize(w, h)
    .flatten({ background: '#18141F' })
    .removeAlpha()
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  let file = join(outDir, `${name}.png`);
  let buf = png;
  if (png.length > MAX_BYTES) {
    file = join(outDir, `${name}.jpg`);
    buf = await sharp(png).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  }
  await sharp(buf).toFile(file);
  const meta = await sharp(file).metadata();
  const { size } = await stat(file);
  console.log(`Wrote ${file.replace(root + '/', '')}: ${meta.width}x${meta.height}, ${meta.channels} channels, ${(size / 1024).toFixed(0)} KB`);
}

// Developer icon: full-bleed spectrum square (no transparent corners), glyph
// scaled down slightly so it survives a circular mask.
{
  const S = 512;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 512 512">
    <defs>${spectrum('g', 0, 512, 512, 0, 'userSpaceOnUse')}</defs>
    <rect width="512" height="512" fill="url(#g)"/>
    <g transform="translate(256 256) scale(0.86) translate(-256 -246)">${glyph}</g>
  </svg>`;
  await write(svg, S, S, 'repasscloud-google-play-icon-512');
}

// Header: ink background, white lockup and tagline centred, spectrum rule along
// the bottom edge.
{
  const W = 4096;
  const H = 2304;
  const logo = await readFile(join(root, 'public', 'brand', 'repasscloud-logo-white.svg'), 'utf8');
  const [, lw, lh] = logo.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const logoW = 2000;
  const logoH = (logoW * lh) / lw;
  const logoInner = logo.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>.*?<\/title>/, '');
  const logoY = H / 2 - logoH / 2 - 120;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${spectrum('rule', 0, 0, 1, 0)}</defs>
    <rect width="${W}" height="${H}" fill="#18141F"/>
    <svg x="${(W - logoW) / 2}" y="${logoY}" width="${logoW}" height="${logoH}" viewBox="0 0 ${lw} ${lh}">${logoInner}</svg>
    ${centredText('Software and books, made in Australia.', W / 2, logoY + logoH + 260, 132, 600, '#C9C4D3', -1)}
    <rect y="${H - 36}" width="${W}" height="36" fill="url(#rule)"/>
  </svg>`;
  await write(svg, W, H, 'repasscloud-google-play-header-4096x2304');
}
