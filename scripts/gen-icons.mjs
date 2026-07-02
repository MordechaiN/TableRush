// Regenerates the PWA icons in public/icons/ (a drawn burger badge — no
// external art). Run whenever the brand look changes:
//
//   node scripts/gen-icons.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const executablePath = process.env.CHROMIUM_PATH
  ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();

const draw = (size, maskable) => `
(() => {
  const S = ${size}, PAD = ${maskable} ? S * 0.12 : 0;
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d');

  // warm gradient tile with rounded corners (full-bleed when maskable)
  const g = c.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#FFE3B8'); g.addColorStop(1, '#EFA85E');
  c.fillStyle = g;
  if (${maskable}) { c.fillRect(0, 0, S, S); }
  else { c.beginPath(); c.roundRect(0, 0, S, S, S * 0.22); c.fill(); }

  const cx = S / 2, cy = S / 2 + PAD * 0.1, u = (S - PAD * 2) / 512;

  // plate
  c.fillStyle = 'rgba(150,80,20,0.25)';
  c.beginPath(); c.ellipse(cx, cy + 150 * u, 190 * u, 60 * u, 0, 0, 7); c.fill();
  c.fillStyle = '#F3D9A0';
  c.beginPath(); c.ellipse(cx, cy + 140 * u, 185 * u, 58 * u, 0, 0, 7); c.fill();
  c.fillStyle = '#FFFFFF';
  c.beginPath(); c.ellipse(cx, cy + 132 * u, 165 * u, 50 * u, 0, 0, 7); c.fill();

  // burger — bottom bun, patty, cheese, top bun
  c.fillStyle = '#E3A24E';
  c.beginPath(); c.roundRect(cx - 120 * u, cy + 60 * u, 240 * u, 46 * u, 20 * u); c.fill();
  c.fillStyle = '#6B3B22';
  c.beginPath(); c.roundRect(cx - 132 * u, cy + 18 * u, 264 * u, 44 * u, 22 * u); c.fill();
  c.fillStyle = '#FFC23D';
  c.beginPath();
  c.moveTo(cx - 140 * u, cy + 24 * u); c.lineTo(cx + 140 * u, cy + 24 * u);
  c.lineTo(cx + 96 * u, cy + 58 * u); c.lineTo(cx + 30 * u, cy + 30 * u);
  c.lineTo(cx - 40 * u, cy + 62 * u); c.lineTo(cx - 108 * u, cy + 32 * u);
  c.closePath(); c.fill();
  c.fillStyle = '#F0B45E';
  c.beginPath(); c.ellipse(cx, cy + 12 * u, 150 * u, 105 * u, 0, Math.PI, 0); c.fill();
  // sesame
  c.fillStyle = '#FFF3D8';
  [[-70, -50], [0, -72], [70, -50], [-35, -20], [40, -22]].forEach(([x, y]) => {
    c.beginPath(); c.ellipse(cx + x * u, cy + y * u, 11 * u, 7 * u, -0.4, 0, 7); c.fill();
  });

  // steam curls
  c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineCap = 'round'; c.lineWidth = 14 * u;
  for (const sx of [-60, 60]) {
    c.beginPath();
    c.moveTo(cx + sx * u, cy - 130 * u);
    c.bezierCurveTo(cx + (sx - 26) * u, cy - 165 * u, cx + (sx + 26) * u, cy - 195 * u, cx + sx * u, cy - 228 * u);
    c.stroke();
  }
  return cv.toDataURL('image/png');
})()`;

for (const [name, size, maskable] of [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
]) {
  const dataUrl = await page.evaluate(draw(size, maskable));
  fs.writeFileSync(path.join(OUT, name), Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('wrote', name);
}
await browser.close();
