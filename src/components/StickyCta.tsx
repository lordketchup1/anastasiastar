import { useEffect, useState } from 'react';
import { links } from '../config/links';
import { Cta } from './Cta';

type Which = 'nano' | 'base' | null;

/**
 * Мобильная плашка: пока на экране блок курса, главная кнопка курса
 * закреплена внизу (PRD, п. 10). На десктопе скрыта CSS-ом.
 */
export function StickyCta() {
  const [which, setWhich] = useState<Which>(null);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-cta]'));
    const visible = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target, e.intersectionRatio);
          else visible.delete(e.target);
        }
        let best: Which = null;
        let bestRatio = 0;
        visible.forEach((ratio, el) => {
          if (ratio >= bestRatio) {
            bestRatio = ratio;
            best = (el as HTMLElement).dataset.cta as Which;
          }
        });
        setWhich(best);
      },
      { threshold: [0, 0.15, 0.4, 0.7] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const nano = which === 'nano';
  return (
    <div className={`sticky-cta${which ? ' is-on' : ''}`} aria-hidden={which ? undefined : true}>
      {which && (
        <>
          <span className="sticky-cta__label">{nano ? 'Идеальная нанопластика · 5 990 ₽' : 'База 3.0'}</span>
          <Cta href={nano ? links.nanoplastyBuy : links.baseCourse} className="sticky-cta__btn">
            {nano ? 'Купить курс' : 'Узнать подробности'}
          </Cta>
        </>
      )}
    </div>
  );
}
