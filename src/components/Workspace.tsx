import { Cta } from './Cta';

interface WorkspaceProps {
  id?: string;
  title: string;
  kicker: string;
  text: string;
  href: string | null;
}

/** Общий блок аренды — Москва и Мытищи используют его с разными данными. */
export function Workspace({ id, title, kicker, text, href }: WorkspaceProps) {
  const headingId = `${id ?? title}-title`.replace(/\s+/g, '-');
  return (
    <section id={id} className="section workspace" data-hair="rent" aria-labelledby={headingId}>
      <div className="container">
        <div className="workspace__card" data-reveal>
          <p className="eyebrow">{kicker}</p>
          <h2 id={headingId} className="h2 workspace__title">{title}</h2>
          <p className="workspace__text">{text}</p>
          <Cta href={href} variant="ghost">Подробнее об аренде</Cta>
        </div>
      </div>
    </section>
  );
}
