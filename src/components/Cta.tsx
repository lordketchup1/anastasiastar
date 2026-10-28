import type { ReactNode } from 'react';

interface CtaProps {
  /** Уже проверенный URL либо null — тогда кнопка отключается. */
  href: string | null;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  /** Ссылка-якорь внутри страницы (открывается в этой же вкладке). */
  internal?: boolean;
  className?: string;
  /** Доп. подпись для скринридеров, если текст кнопки неоднозначен. */
  label?: string;
}

/**
 * Единая кнопка целевого действия.
 * Нет ссылки -> честно отключённая кнопка, а не <a href="#">.
 */
export function Cta({ href, children, variant = 'primary', internal, className = '', label }: CtaProps) {
  const cls = `btn btn--${variant} ${className}`.trim();

  if (!href) {
    return (
      <button type="button" className={`${cls} is-disabled`} disabled aria-label={label ? `${label} (ссылка пока не настроена)` : undefined}>
        <span className="btn__text">{children}</span>
      </button>
    );
  }

  if (internal) {
    return (
      <a className={cls} href={href} aria-label={label}>
        <span className="btn__text">{children}</span>
        <span className="btn__arrow" aria-hidden="true">↓</span>
      </a>
    );
  }

  return (
    <a className={cls} href={href} target="_blank" rel="noopener noreferrer" aria-label={label ? `${label} (откроется в новой вкладке)` : undefined}>
      <span className="btn__text">{children}</span>
      <span className="btn__arrow" aria-hidden="true">↗</span>
      {!label && <span className="sr-only"> (откроется в новой вкладке)</span>}
    </a>
  );
}
