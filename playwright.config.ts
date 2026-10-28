import { defineConfig, devices } from '@playwright/test';

/**
 * Два сервера (127.0.0.1, а не localhost — на Windows localhost может уходить в IPv6):
 *  4173 — боевая сборка (ссылок нет → все кнопки должны быть отключены);
 *  4174 — тестовая сборка с заведомо тестовыми ссылками (проверка href/target/rel).
 * Каждый вариант гоняется на мобильном, планшетном и десктопном вьюпорте.
 */
const viewports = {
  mobile: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } },
  tablet: { viewport: { width: 768, height: 1024 }, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 } },
};

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { browserName: 'chromium', baseURL: 'http://127.0.0.1:4173' },
  webServer: [
    { command: 'npx vite preview --port 4173 --strictPort --host 127.0.0.1 --outDir dist', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
    { command: 'npx vite preview --port 4174 --strictPort --host 127.0.0.1 --outDir dist-test', url: 'http://127.0.0.1:4174', reuseExistingServer: true },
  ],
  projects: Object.entries(viewports).flatMap(([name, cfg]) => [
    { name: `prod-${name}`, use: { ...cfg, baseURL: 'http://127.0.0.1:4173' }, metadata: { links: false, viewport: name } },
    { name: `linked-${name}`, use: { ...cfg, baseURL: 'http://127.0.0.1:4174' }, metadata: { links: true, viewport: name } },
  ]),
});
