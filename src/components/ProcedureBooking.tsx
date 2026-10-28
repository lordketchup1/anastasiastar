import { links } from '../config/links';
import { Cta } from './Cta';

export function ProcedureBooking() {
  return (
    <section id="procedures" className="section booking" data-hair="procedures" aria-labelledby="booking-title">
      <div className="container booking__inner">
        <p className="eyebrow" data-reveal>Процедуры</p>
        <h2 id="booking-title" className="h2 booking__title" data-reveal>Запись на процедуры</h2>
        <p className="lead booking__lead" data-reveal>
          Напишите в Telegram — Анастасия ответит и поможет записаться.
        </p>
        <div className="booking__actions" data-reveal>
          <Cta href={links.bookingTelegram}>Написать в Telegram</Cta>
        </div>
      </div>
    </section>
  );
}
