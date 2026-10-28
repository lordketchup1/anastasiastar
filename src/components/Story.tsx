import { useEffect, useRef, useState } from 'react';

/**
 * Скролл-история на sticky-сцене: длинная секция, внутри — «приклеенная» сцена.
 * Прогресс скролла переключает три главы, а холст с волосами в это время
 * «расчёсывается» слева направо (см. HairCanvas / HairRenderer.setSweep).
 * Это нативный sticky, без библиотек и без перехвата колеса мыши.
 */
const BEATS = [
  {
    kicker: 'Волосы',
    title: 'У каждых волос своя история',
    text: 'Структура, исходное состояние, прошлые процедуры — всё это определяет, как с волосами работать.',
    icon: (
      <path d="M6 14c6-8 10 8 16 0s10 8 16 0 10 8 16 0M6 26c6-8 10 8 16 0s10 8 16 0 10 8 16 0" />
    ),
  },
  {
    kicker: 'Мастер',
    title: 'В салоне всё решает рука мастера',
    text: 'Он оценивает исходник, выбирает технику и аккуратно ведёт процедуру от начала до конца.',
    icon: (
      <>
        <circle cx="14" cy="38" r="7" />
        <circle cx="34" cy="38" r="7" />
        <path d="M18 32 52 6M30 32 6 6" />
      </>
    ),
  },
  {
    kicker: 'Ремесло',
    title: 'Этому можно научиться',
    text: 'С нуля или углубляя практику. Анастасия — тренер-технолог реконструкции волос с 2017 года.',
    icon: (
      <>
        <rect x="6" y="10" width="52" height="12" rx="3" />
        <path d="M12 22v18M20 22v18M28 22v18M36 22v18M44 22v18M52 22v18" />
      </>
    ),
  },
] as const;

export function Story() {
  const ref = useRef<HTMLElement>(null);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    // геометрию читаем только при ресайзе/смене вёрстки, а не на каждый кадр скролла (без forced layout)
    let top = 0;
    let height = 0;
    const measure = () => {
      top = el.getBoundingClientRect().top + window.scrollY;
      height = el.offsetHeight;
    };
    const update = () => {
      raf = 0;
      const total = height - window.innerHeight;
      const p = total > 0 ? (window.scrollY - top) / total : 0;
      const next = Math.min(BEATS.length - 1, Math.max(0, Math.floor(p * BEATS.length)));
      setBeat((b) => (b === next ? b : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    update();
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="story" ref={ref} className="story" data-story data-hair="story" aria-label="История о работе с волосами">
      <div className="story__stage" data-beat={beat}>
        <div className="container story__inner">
          <ol className="story__ticks" aria-hidden="true">
            {BEATS.map((b, i) => (
              <li key={b.kicker} className={i === beat ? 'is-on' : i < beat ? 'is-past' : ''}>
                <span>{`0${i + 1}`}</span>
              </li>
            ))}
          </ol>
          <div className="story__beats">
            {BEATS.map((b, i) => (
              <article key={b.kicker} className={`beat${i === beat ? ' is-on' : ''}`} aria-hidden="true">
                <svg className="beat__icon" viewBox="0 0 64 48" aria-hidden="true">
                  <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    {b.icon}
                  </g>
                </svg>
                <p className="eyebrow">{b.kicker}</p>
                <h2 className="beat__title">{b.title}</h2>
                <p className="beat__text">{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      {/* Для читателей без анимации (и поисковиков) — вся история текстом */}
      <div className="sr-only">
        {BEATS.map((b) => (
          <p key={b.kicker}>
            {b.title}. {b.text}
          </p>
        ))}
      </div>
    </section>
  );
}
