import { useEffect } from 'react';
import { About } from './components/About';
import { BaseCourse } from './components/BaseCourse';
import { Footer } from './components/Footer';
import { HairCanvas } from './components/HairCanvas';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MoscowWorkspace } from './components/MoscowWorkspace';
import { MytishchiWorkspace } from './components/MytishchiWorkspace';
import { NanoplastyCourse } from './components/NanoplastyCourse';
import { ProcedureBooking } from './components/ProcedureBooking';
import { StickyCta } from './components/StickyCta';
import { Story } from './components/Story';

/** Плавное появление блоков при входе в экран. Один IntersectionObserver на всю страницу. */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function App() {
  useReveal();
  return (
    <>
      <HairCanvas />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <a className="skip" href="#main">К содержимому</a>
      <Header />
      <main id="main">
        <Hero />
        <Story />
        <About />
        <NanoplastyCourse />
        <BaseCourse />
        <ProcedureBooking />
        <MoscowWorkspace />
        <MytishchiWorkspace />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
