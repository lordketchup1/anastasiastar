// Проверка перед публикацией: все ли внешние ссылки заданы и корректны.
// Запуск: npm run check:links
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/config/site.ts'), 'utf8');
const env = (() => {
  try {
    return readFileSync(join(root, '.env'), 'utf8');
  } catch {
    return '';
  }
})();

const field = (name) => {
  const m = src.match(new RegExp(`${name}:\\s*(?:env\\.[A-Z_]+\\s*\\?\\?\\s*)?'([^']*)'`));
  return m ? m[1].trim() : '';
};

const required = [
  ['nanoplastyBuyUrl', 'Ссылка на покупку «Идеальная нанопластика»', 'https'],
  ['telegramBase', 'Telegram для «База 3.0»', 'tg'],
  ['telegramBooking', 'Telegram для записи на процедуры', 'tg'],
  ['telegramRent', 'Telegram по аренде (Москва и Мытищи)', 'tg'],
  ['telegramDev', 'Telegram разработчика («Хотите такой же сайт?»)', 'tg'],
];

let bad = 0;
for (const [key, label, kind] of required) {
  const v = field(key);
  let ok = false;
  if (kind === 'https') ok = /^https:\/\/[^\s]+$/.test(v);
  else ok = /^(@?[A-Za-z][A-Za-z0-9_]{4,31}|(https:\/\/)?(www\.)?t\.me\/[A-Za-z][A-Za-z0-9_]{4,31})$/.test(v);
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}${v ? ` → ${v}` : ' — не задано'}`);
  if (!ok) bad++;
}

const siteUrl = (env.match(/^VITE_SITE_URL=(.*)$/m)?.[1] ?? '').trim();
const siteOk = /^https:\/\/.+\/$/.test(siteUrl);
console.log(`${siteOk ? 'OK  ' : 'FAIL'} VITE_SITE_URL (.env) для превью в мессенджерах${siteUrl ? ` → ${siteUrl}` : ' — не задано'}`);
if (!siteOk) bad++;

console.log(bad ? `\nНе готово к публикации: проблем — ${bad}` : '\nВсе ссылки на месте.');
process.exit(bad ? 1 : 0);
