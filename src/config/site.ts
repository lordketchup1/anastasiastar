/**
 * Единственное место, где живут внешние ссылки и контент-константы.
 * Пустая строка = ссылка ещё не предоставлена: кнопка отображается как
 * отключённая и никуда не ведёт (требование PRD, п. 8).
 * Перед публикацией: `npm run check:links` должен пройти без ошибок.
 */

export interface SiteConfig {
  name: string;
  role: string;
  /** Покупка / оплата курса «Идеальная нанопластика» (полный https-URL; сейчас — Telegram-бот). */
  nanoplastyBuyUrl: string;
  /** Telegram для обращений по «База 3.0» (username без @ или ссылка t.me/…); текст — messages.base. */
  telegramBase: string;
  /** Telegram для записи на процедуры; текст — messages.booking. */
  telegramBooking: string;
  /** Telegram по аренде рабочих мест; текст — messages.rentMoscow / messages.rentMytishchi. */
  telegramRent: string;
  /** Telegram разработчика сайта (кнопка «Хотите такой же сайт?» в подвале). */
  telegramDev: string;
  /** Соцсети — необязательно; пустые не показываются. */
  socials: { label: string; url: string }[];
  /** Страница политики обработки персональных данных (добавится позже). */
  privacyUrl: string;
}

/**
 * Значения можно задать прямо здесь ИЛИ через переменные окружения (.env.<mode>).
 * Env нужен автотестам (режим `test` подставляет заведомо тестовые https://example.com/…);
 * в обычной сборке .env не содержит этих переменных, и действуют значения ниже.
 */
const env = import.meta.env;

export const site: SiteConfig = {
  name: 'Анастасия Старшинова',
  role: 'Тренер-технолог реконструкции волос с 2017 года',
  nanoplastyBuyUrl: env.VITE_NANOPLASTY_BUY_URL ?? 'https://t.me/keratin_anastasia_bot',
  telegramBase: env.VITE_TELEGRAM_BASE ?? 'by_anastasiya_star',
  telegramBooking: env.VITE_TELEGRAM_BOOKING ?? 'by_anastasiya_star',
  telegramRent: env.VITE_TELEGRAM_RENT ?? 'Zendarik',
  telegramDev: env.VITE_TELEGRAM_DEV ?? 'l0rd_ketchup',
  socials: [{ label: 'Instagram', url: 'https://www.instagram.com/by_anastasiya_star/' }],
  privacyUrl: env.VITE_PRIVACY_URL ?? '',
};

/** Тексты, которые подставляются в Telegram при переходе по кнопке. */
export const messages = {
  base: 'Здравствуйте! Меня интересует базовое обучение с нуля «База 3.0»',
  booking: 'Здравствуйте, я хочу записаться',
  rentMoscow: 'Здравствуйте, хочу арендовать кресло в Москве',
  rentMytishchi: 'Здравствуйте, хочу арендовать кресло в Мытищах',
  site: 'Здравствуйте, хочу сайт',
};

/**
 * Фото лежат в public/photos. Подготовить новое: node scripts/optimize-photo.mjs <файл> <имя>.
 * Формат кадра — вертикальный 3:4.
 */
export const photos = {
  portrait: {
    src: './photos/anastasia-720.webp',
    srcSet: './photos/anastasia-480.webp 480w, ./photos/anastasia-720.webp 720w',
    width: 720,
    height: 960,
  },
  portraitAlt: 'Анастасия Старшинова',
};
