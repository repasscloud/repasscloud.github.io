// Builds the RePass Cloud logo SVGs in public/brand/ (mark, lockups, wordmark).
// The wordmark is Schibsted Grotesk Bold (script/fonts/, SIL OFL), outlined to
// paths so the SVGs render identically everywhere without the font installed.
//
// Only needed if the mark geometry or wordmark changes. Requires opentype.js,
// which is deliberately not a project dependency:
//   npm i --no-save opentype.js@1.3.4 && node script/generate-brand-svgs.mjs
// Then re-render PNGs/favicons with: node script/generate-brand-assets.mjs
import opentype from 'opentype.js';
import fs from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
const OUT = process.argv[2] ?? here + '../public/brand';
const font = opentype.loadSync(here + 'fonts/SchibstedGrotesk-700.ttf');

// ---- Mark (512 grid) ----
const cx = 263, cy = 267, r = 116, sw = 50;
const rad = d => d * Math.PI / 180;
const p = (a, rr = r) => [cx + rr * Math.cos(rad(a)), cy + rr * Math.sin(rad(a))];
const f = n => +n.toFixed(2);
const A0 = -62, A1 = 24; // arrow end (top right) and tail (lower right)
const [sx, sy] = p(A0), [ex, ey] = p(A1);
const T = [-Math.sin(rad(A0)), Math.cos(rad(A0))]; // clockwise tangent at arrow end
const N = [Math.cos(rad(A0)), Math.sin(rad(A0))];
const half = 62, len = 74;
const tri = [[sx + N[0]*half, sy + N[1]*half], [sx - N[0]*half, sy - N[1]*half], [sx + T[0]*len, sy + T[1]*len]];
const arc = `M${f(sx)} ${f(sy)}A${r} ${r} 0 1 0 ${f(ex)} ${f(ey)}`;
const triD = `M${tri.map(q => f(q[0]) + ' ' + f(q[1])).join('L')}Z`;
const glyph = (c) => `<path d="${arc}" fill="none" stroke="${c}" stroke-width="${sw}"/><circle cx="${f(ex)}" cy="${f(ey)}" r="${sw/2}" fill="${c}"/><path d="${triD}" fill="${c}" stroke="${c}" stroke-width="10" stroke-linejoin="round"/>`;
const grad = (id) => `<linearGradient id="${id}" x1="0" y1="512" x2="512" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFBE16"/><stop offset=".5" stop-color="#E35F9A"/><stop offset="1" stop-color="#AB2DF3"/></linearGradient>`;
const tile = (fill) => `<rect width="512" height="512" rx="120" fill="${fill}"/>`;

const markInner = (id) => `<defs>${grad(id)}</defs>${tile(`url(#${id})`)}${glyph('#FFFFFF')}`;
const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

fs.writeFileSync(`${OUT}/repasscloud-mark.svg`, svg(512, 512, markInner('rpc-g'), 'RePass Cloud'));
fs.writeFileSync(`${OUT}/repasscloud-mark-black.svg`, svg(512, 512, `${tile('#18141F')}${glyph('#FFFFFF')}`, 'RePass Cloud'));
fs.writeFileSync(`${OUT}/repasscloud-mark-white.svg`, svg(512, 512, `${tile('#FFFFFF')}${glyph('#18141F')}`, 'RePass Cloud'));
// glyph-only (no tile), for embossing / single-colour use
fs.writeFileSync(`${OUT}/repasscloud-symbol-black.svg`, svg(512, 512, glyph('#18141F'), 'RePass Cloud'));

// ---- Wordmark ----
const text = 'RePass Cloud';
const size = 330;
const tracking = -0.012 * size;
let x = 0; const paths = [];
const glyphs = font.stringToGlyphs(text);
for (let i = 0; i < glyphs.length; i++) {
  const g = glyphs[i];
  paths.push(g.getPath(x, 0, size).toPathData(2));
  let adv = g.advanceWidth * size / font.unitsPerEm;
  if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * size / font.unitsPerEm;
  x += adv + tracking;
}
const wordW = x - tracking;
const capH = font.tables.os2.sCapHeight * size / font.unitsPerEm;
const desc = 0; // no descenders in "RePass Cloud"
const wordPath = paths.join('');

// Horizontal lockup: mark height = 512, cap height aligned optically to ~45% of tile
const markH = 512, gap = 150;
const scale = 1; // wordmark size already set
const capTop = (markH - capH) / 2;
const baseline = capTop + capH;
const W = Math.ceil(markH + gap + wordW);
const lock = (wordFill, id) => `<defs>${grad(id)}</defs><g>${tile(`url(#${id})`)}${glyph('#FFFFFF')}</g><path transform="translate(${markH + gap} ${f(baseline)})" d="${wordPath}" fill="${wordFill}"/>`;
fs.writeFileSync(`${OUT}/repasscloud-logo.svg`, svg(W, markH, lock('#18141F', 'rpc-g'), 'RePass Cloud'));
fs.writeFileSync(`${OUT}/repasscloud-logo-white.svg`, svg(W, markH, lock('#FFFFFF', 'rpc-g'), 'RePass Cloud'));
// Wordmark only
const ww = Math.ceil(wordW), wh = Math.ceil(capH + 20);
fs.writeFileSync(`${OUT}/repasscloud-wordmark.svg`, svg(ww, wh, `<path transform="translate(0 ${f(capH + 2)})" d="${wordPath}" fill="#18141F"/>`, 'RePass Cloud'));
fs.writeFileSync(`${OUT}/repasscloud-wordmark-white.svg`, svg(ww, wh, `<path transform="translate(0 ${f(capH + 2)})" d="${wordPath}" fill="#FFFFFF"/>`, 'RePass Cloud'));
console.log({ W, wordW, capH });
