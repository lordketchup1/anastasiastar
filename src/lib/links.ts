/**
 * Нормализация и сборка внешних ссылок. Всё, что не проходит проверку,
 * превращается в null — кнопка тогда отключается, а не ведёт «куда попало».
 */

const TG_USERNAME = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;

/** Принимает только https-ссылки. */
export function safeHttpsUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Достаёт Telegram username из "name", "@name", "t.me/name" или "https://t.me/name". */
export function parseTelegramUsername(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;
  value = value.replace(/^https?:\/\//i, '').replace(/^(www\.)?(t\.me|telegram\.me)\//i, '');
  value = value.replace(/^@/, '').split(/[/?#]/)[0] ?? '';
  return TG_USERNAME.test(value) ? value : null;
}

/** https://t.me/<username>?text=<url-encoded-message> */
export function telegramLink(raw: string, message?: string): string | null {
  const username = parseTelegramUsername(raw);
  if (!username) return null;
  const base = `https://t.me/${username}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
