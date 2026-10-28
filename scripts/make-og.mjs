// Генерирует public/og.png (1200×630) — превью ссылки для мессенджеров.
// Запуск: node scripts/make-og.mjs
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { writeFileSync } from 'node:fs';

const font = (pkg, file) => pathToFileURL(resolve(`node_modules/@fontsource-variable/${pkg}/files/${file}`)).href;
const photo = pathToFileURL(resolve('public/photos/anastasia-720.webp')).href;

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:C;src:url(${font('cormorant-garamond', 'cormorant-garamond-cyrillic-wght-normal.woff2')});font-weight:300 700;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:C;src:url(${font('cormorant-garamond', 'cormorant-garamond-latin-wght-normal.woff2')});font-weight:300 700;unicode-range:U+0000-00FF}
@font-face{font-family:I;src:url(${font('inter', 'inter-cyrillic-wght-normal.woff2')});font-weight:100 900;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:I;src:url(${font('inter', 'inter-latin-wght-normal.woff2')});font-weight:100 900;unicode-range:U+0000-00FF}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0a0908;color:#ece5d8;font-family:I;position:relative;overflow:hidden}
svg{position:absolute;inset:0}
.t{position:absolute;left:80px;top:150px;width:660px}
.e{font-size:18px;letter-spacing:.24em;text-transform:uppercase;color:#d8bf8f;margin-bottom:26px}
h1{font:500 104px/0.95 C;letter-spacing:-.02em}
h1 em{display:block;font-style:italic;font-weight:400;color:#f3dfb0;padding-left:46px}
p{margin-top:34px;font-size:26px;line-height:1.35;color:#ece5d8;max-width:560px}
.ph{position:absolute;right:80px;top:60px;width:390px;height:520px;border:1px solid rgba(216,191,143,.42);border-radius:6px;overflow:hidden;box-shadow:0 0 0 8px rgba(10,9,8,.6),0 0 0 9px rgba(216,191,143,.18)}
.ph img{width:100%;height:100%;object-fit:cover;object-position:50% 20%;filter:saturate(.92) contrast(1.03)}
.ph:after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,9,8,.1),transparent 30%,transparent 60%,rgba(10,9,8,.55))}
.v{position:absolute;inset:0;background:radial-gradient(120% 90% at 40% 40%,transparent 35%,rgba(10,9,8,.8) 100%)}
</style>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none">${Array.from({ length: 46 }, (_, i) => {
  const o = i / 45 - 0.5;
  const y = 330 + o * 360;
  return `<path d="M-40 ${y - 30} C 220 ${y - 150 + o * 40}, 420 ${y + 120}, 700 ${y - 20} S 1100 ${y + 90 + o * 120}, 1260 ${y - 40}" stroke="rgba(${i % 3 ? '216,191,143' : '184,130,90'},${0.1 + (i % 3) * 0.04})" stroke-width="1"/>`;
}).join('')}</svg>
<div class="v"></div>
<div class="t"><div class="e">Реконструкция волос</div><h1>Анастасия <em>Старшинова</em></h1><p>Тренер-технолог реконструкции волос с 2017 года</p></div>
<div class="ph"><img src="${photo}"></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// setContent открывается как about:blank и не может грузить file://-ресурсы — пишем временный файл
const tmp = join(tmpdir(), 'starshinova-og.html');
writeFileSync(tmp, html);
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('public/og.png готов');
