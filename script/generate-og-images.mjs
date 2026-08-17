// Generates branded 1200x630 Open Graph images from inline SVG using sharp.
// Run with: node script/generate-og-images.mjs
// Re-run any time the brand palette or copy changes; outputs are static
// files committed under public/img/.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'img');

const WIDTH = 1200;
const HEIGHT = 630;

function baseCard({ eyebrow, title, subtitle }) {
  return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c1020" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ab2df3" />
      <stop offset="50%" stop-color="#e35f9a" />
      <stop offset="100%" stop-color="#ffbe16" />
    </linearGradient>
    <linearGradient id="glow2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e92bcf" />
      <stop offset="100%" stop-color="#ab2df3" />
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />

  <circle cx="1040" cy="80" r="360" fill="url(#glow)" opacity="0.28" />
  <circle cx="120" cy="620" r="300" fill="url(#glow2)" opacity="0.22" />

  <rect x="0" y="0" width="10" height="${HEIGHT}" fill="url(#glow)" />

  <text x="90" y="150" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="4" fill="#ffbe16" font-weight="700">${eyebrow.toUpperCase()}</text>

  <text x="88" y="270" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800" fill="#ffffff">${title}</text>

  <text x="90" y="340" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#c7cbe0">${subtitle}</text>

  <text x="90" y="560" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#ffffff">RePass Cloud</text>
  <text x="90" y="592" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#8a90ad">repasscloud.com</text>
</svg>`;
}

const cards = [
  {
    file: 'og-default.png',
    eyebrow: 'Software products and engineering systems',
    title: 'RePass Cloud',
    subtitle: 'Australian software company — products, platforms, and enterprise systems.',
  },
  {
    file: 'og-cursedelete.png',
    eyebrow: 'RePass Cloud product',
    title: 'CurseDelete 2',
    subtitle: 'A native, high-performance deletion engine for files and directory trees.',
  },
];

for (const card of cards) {
  const svg = baseCard(card);
  const outPath = join(outDir, card.file);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`Wrote ${outPath}`);
}
