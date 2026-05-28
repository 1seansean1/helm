// Generate PWA icons from a single SVG source.
// node scripts/gen-icons.mjs

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, "public", "icons");
mkdirSync(out, { recursive: true });

const baseSvg = (size, padding) => {
  const inner = size - padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b0f17"/>
      <stop offset="1" stop-color="#11161f"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#e3a930" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#e3a930" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#g)"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${inner * 0.55}" fill="url(#glow)"/>
  <g transform="translate(${padding},${padding})" stroke="#e3a930" stroke-width="${inner * 0.045}" stroke-linecap="round" fill="none">
    <circle cx="${inner / 2}" cy="${inner / 2}" r="${inner * 0.34}"/>
    <circle cx="${inner / 2}" cy="${inner / 2}" r="${inner * 0.06}" fill="#e3a930"/>
    <line x1="${inner / 2}" y1="${inner * 0.08}" x2="${inner / 2}" y2="${inner * 0.22}"/>
    <line x1="${inner / 2}" y1="${inner * 0.78}" x2="${inner / 2}" y2="${inner * 0.92}"/>
    <line x1="${inner * 0.08}" y1="${inner / 2}" x2="${inner * 0.22}" y2="${inner / 2}"/>
    <line x1="${inner * 0.78}" y1="${inner / 2}" x2="${inner * 0.92}" y2="${inner / 2}"/>
    <line x1="${inner * 0.21}" y1="${inner * 0.21}" x2="${inner * 0.31}" y2="${inner * 0.31}"/>
    <line x1="${inner * 0.69}" y1="${inner * 0.69}" x2="${inner * 0.79}" y2="${inner * 0.79}"/>
    <line x1="${inner * 0.21}" y1="${inner * 0.79}" x2="${inner * 0.31}" y2="${inner * 0.69}"/>
    <line x1="${inner * 0.69}" y1="${inner * 0.31}" x2="${inner * 0.79}" y2="${inner * 0.21}"/>
  </g>
</svg>`;
};

async function render(size, padding, file) {
  const svg = baseSvg(size, padding);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(out, file), buf);
  console.log("wrote", file, "(", buf.length, "bytes )");
}

async function renderAppleTouch() {
  // Apple-touch-icon: 180x180, no transparency.
  const svg = baseSvg(180, 14);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(root, "public", "apple-touch-icon.png"), buf);
  console.log("wrote apple-touch-icon.png");
}

await render(192, 18, "icon-192.png");
await render(512, 48, "icon-512.png");
// Maskable: pad more (Android masks crop ~10-20% on each side).
await render(512, 96, "icon-512-maskable.png");
await renderAppleTouch();

// robots.txt
writeFileSync(join(root, "public", "robots.txt"), "User-agent: *\nAllow: /\n");
console.log("wrote robots.txt");
