import { photos } from '../config/site';

/**
 * Вертикальный кадр 3:4. Если фото в конфиге не задано — элегантная рамка-заглушка
 * (не стоковое фото, как требует PRD).
 */
export function PhotoSlot({ className = '' }: { className?: string }) {
  const p = photos.portrait;
  return (
    <figure className={`photo ${className}`.trim()}>
      <div className="photo__frame">
        {p ? (
          <>
            <img
              src={p.src}
              srcSet={p.srcSet}
              sizes="(min-width: 860px) 360px, min(92vw, 360px)"
              alt={photos.portraitAlt}
              width={p.width}
              height={p.height}
              loading="lazy"
              decoding="async"
            />
            <span className="photo__shade" aria-hidden="true" />
          </>
        ) : (
          <div className="photo__placeholder" role="img" aria-label="Здесь будет фотография Анастасии">
            <svg viewBox="0 0 120 160" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                <circle cx="60" cy="58" r="20" />
                <path d="M22 148c4-30 22-44 38-44s34 14 38 44" />
                <path d="M30 20c10 6 8 12 18 16M42 14c8 6 6 10 14 14" opacity=".5" />
              </g>
            </svg>
            <span>Фото</span>
          </div>
        )}
      </div>
    </figure>
  );
}
