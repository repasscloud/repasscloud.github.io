// Renders the RePass Cloud logo SVGs in public/brand/ into high-resolution
// PNGs, the favicon set, and the app icons.
// Run with: node script/generate-brand-assets.mjs
// The SVGs in public/brand/ are the source of truth (the wordmark is already
// outlined to paths, so no font is needed to render them).

import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = join(root, 'public', 'brand');
const pngDir = join(brand, 'png');
const pub = join(root, 'public');

await mkdir(pngDir, { recursive: true });

const svg = async (name) => readFile(join(brand, name), 'utf8');

async function render(svgText, width, out, { flatten } = {}) {
  // Render at the target width with a density high enough to stay crisp.
  const meta = await sharp(Buffer.from(svgText)).metadata();
  const density = Math.min(2400, Math.ceil((72 * width) / meta.width));
  let img = sharp(Buffer.from(svgText), { density }).resize({ width });
  if (flatten) img = img.flatten({ background: flatten });
  await img.png({ compressionLevel: 9 }).toFile(out);
  console.log(`Wrote ${out.replace(root + '/', '')}`);
}

const mark = await svg('repasscloud-mark.svg');
const markBlack = await svg('repasscloud-mark-black.svg');
const markWhite = await svg('repasscloud-mark-white.svg');
const logo = await svg('repasscloud-logo.svg');
const logoWhite = await svg('repasscloud-logo-white.svg');
const wordmark = await svg('repasscloud-wordmark.svg');
const wordmarkWhite = await svg('repasscloud-wordmark-white.svg');

// Marks: transparent background outside the rounded tile.
for (const size of [256, 512, 1024, 2048, 4096]) {
  await render(mark, size, join(pngDir, `repasscloud-mark-${size}.png`));
}
await render(markBlack, 2048, join(pngDir, 'repasscloud-mark-black-2048.png'));
await render(markWhite, 2048, join(pngDir, 'repasscloud-mark-white-2048.png'));

// Horizontal lockups.
for (const width of [1200, 2400, 4800]) {
  await render(logo, width, join(pngDir, `repasscloud-logo-${width}.png`));
  await render(logoWhite, width, join(pngDir, `repasscloud-logo-white-${width}.png`));
}
// Lockup on a solid background, padded, for places that reject transparency.
{
  const pad = (s, bg) =>
    s
      .replace(/viewBox="0 0 (\d+) (\d+)"/, (_, w, h) => `viewBox="-200 -200 ${+w + 400} ${+h + 400}"`)
      .replace(/width="(\d+)" height="(\d+)"/, (_, w, h) => `width="${+w + 400}" height="${+h + 400}"`)
      .replace('<defs>', `<rect x="-200" y="-200" width="100%" height="100%" fill="${bg}"/><defs>`);
  await render(pad(logo, '#FFFFFF'), 3000, join(pngDir, 'repasscloud-logo-on-white-3000.png'), { flatten: '#FFFFFF' });
  await render(pad(logoWhite, '#18141F'), 3000, join(pngDir, 'repasscloud-logo-on-ink-3000.png'), { flatten: '#18141F' });
}
await render(wordmark, 2400, join(pngDir, 'repasscloud-wordmark-2400.png'));
await render(wordmarkWhite, 2400, join(pngDir, 'repasscloud-wordmark-white-2400.png'));

// Favicons and app icons.
const square = mark.replace('rx="120"', 'rx="0"'); // iOS applies its own mask
await render(mark, 16, join(pub, 'favicon-16x16.png'));
await render(mark, 32, join(pub, 'favicon-32x32.png'));
await render(square, 180, join(pub, 'apple-touch-icon.png'));
await render(mark, 192, join(pub, 'android-chrome-192x192.png'));
await render(mark, 512, join(pub, 'android-chrome-512x512.png'));
await writeFile(join(pub, 'favicon.svg'), mark);

// favicon.ico with embedded PNG images (supported by every current browser).
const icoSizes = [16, 32, 48];
const images = await Promise.all(
  icoSizes.map((s) => sharp(Buffer.from(mark), { density: 300 }).resize(s).png().toBuffer()),
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
const entries = [];
let offset = 6 + 16 * images.length;
images.forEach((buf, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i], 0);
  e.writeUInt8(icoSizes[i], 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  entries.push(e);
});
await writeFile(join(pub, 'favicon.ico'), Buffer.concat([header, ...entries, ...images]));
console.log('Wrote public/favicon.ico');
