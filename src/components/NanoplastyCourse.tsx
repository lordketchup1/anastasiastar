import { links } from '../config/links';
import { Cta } from './Cta';

const CONTENT = [
  'Два теоретических урока',
  'Четыре видеоурока с отработкой разных техник нанопластики',
  'Ссылки на проверенные продукты',
  'Возможность задавать вопросы и получать ответы по материалам курса',
  'Бессрочный доступ к курсу',
];

const RESULTS = [
  'Поймёте, почему нанопластика могла не получаться раньше',
  'Освоите четыре разные техники нанопластики',
  'Научитесь работать даже со сложными исходниками и добиваться выпрямления с первого раза',
];

export function NanoplastyCourse() {
  return (
    <section id="courses" className="section course course--nano" data-hair="nano" aria-labelledby="nano-title">
      <div className="container course__grid" data-cta="nano">
        <div className="course__aside" data-reveal>
          <p className="eyebrow">Онлайн-курс · для практикующих мастеров</p>
          <h2 id="nano-title" className="h2 course__title">
            Идеальная <em>нанопластика</em>
          </h2>
          <p className="price" aria-label="Стоимость 5 990 рублей">
            <span className="price__num">5&nbsp;990</span>
            <span className="price__cur"> ₽</span>
          </p>
          <Cta href={links.nanoplastyBuy} className="course__cta">Купить курс</Cta>
        </div>

        <div className="course__body">
          <article className="panel" data-reveal>
            <h3 className="h3">Что внутри</h3>
            <ul className="list">
              {CONTENT.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
          <article className="panel panel--accent" data-reveal style={{ ['--d' as string]: '100ms' }}>
            <h3 className="h3">После курса вы</h3>
            <ul className="list list--check">
              {RESULTS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
