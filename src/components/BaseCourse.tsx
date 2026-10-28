import { links } from '../config/links';
import { Cta } from './Cta';

const LESSONS = [
  'Девять теоретических онлайн-уроков с демонстрацией процедур на моделях',
  'Отдельный блок о поиске первых клиентов с пошаговой инструкцией',
  'Бессрочный доступ к теоретическим материалам',
  'Офлайн-практика на выбор: один или два дня',
];

const MATERIALS = [
  'Первая закупка',
  'Где и как работать легально',
  'Обработка инструментов',
  'Шаблоны договоров и согласий',
];

const FOR = [
  'Тем, кто хочет освоить новую профессию с нуля, без опыта',
  'Мастерам, которые уже проходили базовое обучение, но не получили достаточно знаний и уверенности для самостоятельной работы',
];

export function BaseCourse() {
  return (
    <section id="base" className="section course course--base" data-hair="base" aria-labelledby="base-title">
      <div className="container course__grid" data-cta="base">
        <div className="course__aside" data-reveal>
          <p className="eyebrow">Базовое обучение с нуля</p>
          <h2 id="base-title" className="h2 course__title">
            База <em>3.0</em>
          </h2>
          <div className="formats" role="group" aria-label="Форматы обучения">
            <span className="chip">Индивидуально</span>
            <span className="chip">В мини-группе до шести человек</span>
          </div>
          <Cta href={links.baseCourse} className="course__cta">Узнать подробности</Cta>
        </div>

        <div className="course__body">
          <article className="panel" data-reveal>
            <h3 className="h3">Программа</h3>
            <ul className="list">
              {LESSONS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
          <article className="panel" data-reveal style={{ ['--d' as string]: '80ms' }}>
            <h3 className="h3">Полезные ссылки и материалы</h3>
            <ul className="list list--tags">
              {MATERIALS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
          <article className="panel panel--accent" data-reveal style={{ ['--d' as string]: '160ms' }}>
            <h3 className="h3">Кому подходит</h3>
            <ul className="list list--check">
              {FOR.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
