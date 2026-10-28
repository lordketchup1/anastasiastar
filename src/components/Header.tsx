import { useEffect, useRef, useState } from 'react';

const NAV = [
  { href: '#courses', label: 'Курсы' },
  { href: '#procedures', label: 'Процедуры' },
  { href: '#rent', label: 'Аренда' },
  { href: '#contacts', label: 'Контакты' },
];

export function Header() {
  const sentinel = useRef<HTMLDivElement>(null);
  const [solid, setSolid] = useState(false);

  // Без scroll-обработчика: фон шапки включается, когда «сторож» ушёл за верх экрана.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} className="header-sentinel" aria-hidden="true" />
      <header className={`header${solid ? ' is-solid' : ''}`}>
        <a className="header__brand" href="#top">
          <span className="header__mono" aria-hidden="true">АС</span>
          <span className="header__name">Анастасия Старшинова</span>
        </a>
        <nav aria-label="Разделы сайта">
          <ul className="header__nav">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
