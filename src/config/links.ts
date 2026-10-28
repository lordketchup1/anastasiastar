import { messages, site } from './site';
import { safeHttpsUrl, telegramLink } from '../lib/links';

/** Готовые, проверенные ссылки для компонентов. null = ссылка не настроена. */
export const links = {
  nanoplastyBuy: safeHttpsUrl(site.nanoplastyBuyUrl),
  baseCourse: telegramLink(site.telegramBase, messages.base),
  bookingTelegram: telegramLink(site.telegramBooking, messages.booking),
  rentMoscow: telegramLink(site.telegramRent, messages.rentMoscow),
  rentMytishchi: telegramLink(site.telegramRent, messages.rentMytishchi),
  devSite: telegramLink(site.telegramDev, messages.site),
  privacy: safeHttpsUrl(site.privacyUrl),
  socials: site.socials
    .map((s) => ({ label: s.label, url: safeHttpsUrl(s.url) }))
    .filter((s): s is { label: string; url: string } => s.url !== null),
};
