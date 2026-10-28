import { site } from '../config/site';
import { Cta } from './Cta';

function Letters({ text, from }: { text: string; from: number }) {
  return (
    <span className="hero__word" aria-hidden="true">
      {Array.from(text).map((ch, i) => (
        <span key={i} className="hero__ch" style={{ ['--i' as string]: from + i }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const [first, last] = site.name.split(' ');
  return (
    <section id="top" className="hero" data-hair="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <p className="eyebrow hero__eyebrow">Реконструкция волос</p>
        <h1 id="hero-title" className="hero__title" aria-label={site.name}>
          <Letters text={first} from={0} />
          <Letters text={last} from={first.length} />
        </h1>
        <p className="hero__role">{site.role}</p>
        <div className="hero__actions">
          <Cta href="#courses" internal>Курсы</Cta>
          <Cta href="#procedures" internal variant="ghost">Запись на процедуры</Cta>
          <Cta href="#rent" internal variant="ghost">Аренда рабочего места</Cta>
        </div>
      </div>
      <a className="hero__scroll" href="#story" aria-label="Листайте вниз — история">
        <span>Листайте</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
