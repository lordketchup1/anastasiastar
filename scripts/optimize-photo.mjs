// Готовит фото для сайта: кроп строго 3:4 (вертикальный кадр), WebP двух размеров.
// Запуск: node scripts/optimize-photo.mjs <исходник> <имя-без-расширения>
// По умолчанию: assets-src/anastasia-original.png → public/photos/anastasia-{480,720}.webp
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const src = process.argv[2] ?? 'assets-src/anastasia-original.png';
const name = process.argv[3] ?? 'anastasia';
mkdirSync('public/photos', { recursive: true });

const meta = await sharp(src).metadata();
// Кадр 3:4. Берём максимум исходника, смещая окно к верху/центру (лицо и волосы важнее низа).
const targetRatio = 3 / 4;
let w = meta.width;
let h = Math.round(w / targetRatio);
if (h > meta.height) {
  h = meta.height;
  w = Math.round(h * targetRatio);
}
const left = Math.round((meta.width - w) / 2);
const top = 0;

for (const width of [480, 720]) {
  const out = `public/photos/${name}-${width}.webp`;
  const info = await sharp(src)
    .extract({ left, top, width: w, height: h })
    .resize({ width, height: Math.round(width / targetRatio) })
    .webp({ quality: 78, effort: 6 })
    .toFile(out);
  console.log(`${out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} КБ`);
}
