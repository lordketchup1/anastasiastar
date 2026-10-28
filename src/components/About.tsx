import { site } from '../config/site';
import { PhotoSlot } from './PhotoSlot';

export function About() {
  return (
    <section className="section about" data-hair="about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__text" data-reveal>
          <p className="eyebrow">О специалисте</p>
          <h2 id="about-title" className="h2">{site.name}</h2>
          <p className="lead">{site.role}.</p>
          <p>
            Ниже — два формата обучения для мастеров, запись на процедуры по реконструкции волос и
            аренда рабочих мест в Москве и Мытищах.
          </p>
        </div>
        <div data-reveal style={{ ['--d' as string]: '120ms' }}>
          <PhotoSlot />
        </div>
      </div>
    </section>
  );
}
