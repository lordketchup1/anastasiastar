import { useEffect, useRef } from 'react';
import { HAIR_PRESETS, HairRenderer } from '../lib/hair';

interface Block {
  key: string;
  top: number;
}

/**
 * Фиксированный холст за всем контентом. Читает позицию скролла и:
 *  - выбирает пресет волос по секции в центре экрана ([data-hair]);
 *  - ведёт «расчёсывание» по прогрессу сцены [data-story];
 *  - пишет --hero-p (0..1) для параллакса первого экрана.
 */
export function HairCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const mobile = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: HairRenderer;
    try {
      renderer = new HairRenderer(canvas, { mobile, reduced });
    } catch {
      return; // без холста сайт остаётся полностью рабочим
    }

    let blocks: Block[] = [];
    let storyTop = 0;
    let storyHeight = 0;
    let raf = 0;
    let last = performance.now();
    let heroP = -1;
    let snapNext = true;
    // --hero-p пишем только в блок героя: запись на :root инвалидирует стили всей страницы каждый кадр
    const heroInner = document.querySelector<HTMLElement>('.hero__inner');
    // адаптивное качество: если кадры стабильно длиннее нормы — упрощаем рендер
    let emaDt = 0;
    let warmup = 150; // первые секунды — шрифты, вступительные анимации, не считаем
    let slowFrames = 0;
    const budget = mobile ? 45 : 24; // мс: выше — устройство не тянет

    const measure = () => {
      const sy = window.scrollY;
      blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-hair]')).map((el) => ({
        key: el.dataset.hair ?? 'hero',
        top: el.getBoundingClientRect().top + sy,
      }));
      const story = document.querySelector<HTMLElement>('[data-story]');
      if (story) {
        storyTop = story.getBoundingClientRect().top + sy;
        storyHeight = story.offsetHeight;
      } else {
        storyHeight = 0;
      }
    };

    const syncTargets = (snap: boolean) => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const center = sy + vh * 0.5;
      let key = 'hero';
      for (const b of blocks) if (b.top <= center) key = b.key;
      renderer.setTarget(HAIR_PRESETS[key] ?? HAIR_PRESETS.hero, snap);

      if (storyHeight > vh) {
        const p = (sy - storyTop) / (storyHeight - vh);
        renderer.setSweep(p > -0.02 && p < 1.04 ? p : null, snap);
      } else {
        renderer.setSweep(null, snap);
      }

      const hp = Math.min(1, Math.max(0, sy / vh));
      if (heroInner && Math.abs(hp - heroP) > 0.004) {
        heroP = hp;
        heroInner.style.setProperty('--hero-p', hp.toFixed(3));
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const elapsed = now - last;
      if (mobile && elapsed < 32) return; // ~30 fps на телефонах
      last = now;

      if (warmup > 0) warmup--;
      else if (!snapNext) {
        emaDt = emaDt ? emaDt * 0.9 + elapsed * 0.1 : elapsed;
        if (emaDt > budget) {
          if (++slowFrames > 40 && renderer.degrade()) {
            slowFrames = 0;
            emaDt = 0;
            warmup = 60;
          }
        } else {
          slowFrames = 0;
        }
      }

      syncTargets(snapNext);
      renderer.frame(Math.min(0.05, elapsed / 1000), snapNext);
      snapNext = false;
    };

    const start = () => {
      if (reduced || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // reduced-motion: статичная картинка, перерисовка только по скроллу/ресайзу
    let staticQueued = false;
    const drawStatic = () => {
      if (staticQueued) return;
      staticQueued = true;
      requestAnimationFrame(() => {
        staticQueued = false;
        syncTargets(true);
        renderer.frame(0, true);
      });
    };

    const onResize = () => {
      const changed = renderer.resize();
      measure();
      if (changed) snapNext = true;
      if (reduced) drawStatic();
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    measure();
    syncTargets(true);
    renderer.frame(0, true);
    start();

    const ro = new ResizeObserver(() => {
      measure();
      if (reduced) drawStatic();
    });
    ro.observe(document.body);
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    if (reduced) window.addEventListener('scroll', drawStatic, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      window.removeEventListener('scroll', drawStatic);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="hair" aria-hidden="true" />;
}
