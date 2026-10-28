// Замер FPS в headless Chromium с замедлением CPU. Запуск: node scripts/bench-fps.mjs [url]
// Сервер должен уже работать (npm run preview).
import { chromium, devices } from '@playwright/test';

const url = process.argv[2] ?? 'http://127.0.0.1:4173/';
const cases = [
  { name: 'desktop x1', ctx: { viewport: { width: 1440, height: 900 } }, cpu: 1 },
  { name: 'desktop x4', ctx: { viewport: { width: 1440, height: 900 } }, cpu: 4 },
  { name: 'mobile  x4', ctx: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } }, cpu: 4 },
  { name: 'mobile  x6', ctx: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } }, cpu: 6 },
];

const browser = await chromium.launch();
for (const c of cases) {
  const context = await browser.newContext(c.ctx);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: c.cpu });
  await page.goto(url);
  await page.waitForTimeout(2500);
  const res = await page.evaluate(async () => {
    const frames = [];
    let last = performance.now();
    let y = 0;
    const end = last + 5000;
    await new Promise((resolve) => {
      const step = (now) => {
        frames.push(now - last);
        last = now;
        y += 14; // непрерывный скролл
        window.scrollTo(0, y % (document.documentElement.scrollHeight - innerHeight));
        now < end ? requestAnimationFrame(step) : resolve();
      };
      requestAnimationFrame(step);
    });
    frames.sort((a, b) => a - b);
    const avg = frames.reduce((s, v) => s + v, 0) / frames.length;
    return { fps: +(1000 / avg).toFixed(1), p95: +frames[Math.floor(frames.length * 0.95)].toFixed(1) };
  });
  console.log(`${c.name.padEnd(11)} fps≈${res.fps}  p95 кадра=${res.p95} мс`);
  await context.close();
}
await browser.close();
