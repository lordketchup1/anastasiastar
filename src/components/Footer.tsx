import { links } from '../config/links';
import { site } from '../config/site';
import { Cta } from './Cta';

export function Footer() {
  return (
    <footer id="contacts" className="footer" data-hair="contacts">
      <div className="container footer__inner">
        <div>
          <p className="eyebrow">Контакты</p>
          <p className="footer__name">{site.name}</p>
          <p className="footer__role">{site.role}</p>
        </div>
        <div className="footer__actions">
          <Cta href={links.bookingTelegram}>Написать в Telegram</Cta>
          {links.socials.map((s) => (
            <Cta key={s.url} href={s.url} variant="ghost">{s.label}</Cta>
          ))}
        </div>
        <Cta href={links.devSite} variant="ghost" className="footer__promo">Хотите такой же сайт?</Cta>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} {site.name}</span>
        {links.privacy && (
          <ul className="footer__links">
            <li>
              <a href={links.privacy}>Политика обработки персональных данных</a>
            </li>
          </ul>
        )}
      </div>
    </footer>
  );
}
