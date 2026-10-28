import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const hasLinks = (info: { project: { metadata: { links?: boolean } } }) => info.project.metadata.links === true;

const tg = (user: string, text: string) => `https://t.me/${user}?text=${encodeURIComponent(text)}`;

/** Ожидаемые ссылки: боевая сборка (реальные значения) и тестовая (.env.test). */
function expectedLinks(info: { project: { metadata: { links?: boolean } } }) {
  const linked = hasLinks(info);
  const base = linked ? 'test_base' : 'by_anastasiya_star';
  const booking = linked ? 'test_booking' : 'by_anastasiya_star';
  const rent = linked ? 'test_rent' : 'Zendarik';
  const dev = linked ? 'test_dev' : 'l0rd_ketchup';
  return {
    dev: tg(dev, 'Здравствуйте, хочу сайт'),
    nano: linked ? 'https://example.com/pay/nanoplastika' : 'https://t.me/keratin_anastasia_bot',
    base: tg(base, 'Здравствуйте! Меня интересует базовое обучение с нуля «База 3.0»'),
    booking: tg(booking, 'Здравствуйте, я хочу записаться'),
    rentMoscow: tg(rent, 'Здравствуйте, хочу арендовать кресло в Москве'),
    rentMytishchi: tg(rent, 'Здравствуйте, хочу арендовать кресло в Мытищах'),
  };
}

/** Собирает ошибки консоли, исключения страницы и упавшие запросы. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`console.${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`);
  });
  return errors;
}

/** Прокручивает страницу до низа ступенями, чтобы сработали все IntersectionObserver. */
async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = page.viewportSize()!.height;
  for (let y = 0; y < h; y += Math.round(vh * 0.6)) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' as ScrollBehavior }), y);
    await page.waitForTimeout(60);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('нет ошибок и предупреждений в консоли, нет упавших запросов', async ({ page }) => {
  const errors = watchErrors(page);
  await page.reload();
  await scrollThrough(page);
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('метаданные: lang, title, description, OG, favicon', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page).toHaveTitle(/Анастасия Старшинова/);
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc!.length).toBeGreaterThan(60);
  for (const p of ['og:title', 'og:description', 'og:image', 'og:type', 'og:url']) {
    await expect(page.locator(`meta[property="${p}"]`)).toHaveCount(1);
  }
  await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
  expect(await page.locator('h1').count()).toBe(1);
});

test('нет горизонтальной прокрутки и вылезающих за экран блоков', async ({ page }) => {
  await scrollThrough(page);
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders: string[] = [];
    document.querySelectorAll<HTMLElement>('main *, header *, footer *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (getComputedStyle(el).position === 'fixed') return;
      if (el.closest('.sr-only')) return;
      if (r.right > vw + 1 || r.left < -1) offenders.push(`${el.tagName}.${el.className} [${Math.round(r.left)}..${Math.round(r.right)}]`);
    });
    return {
      scrollW: document.documentElement.scrollWidth,
      bodyScrollW: document.body.scrollWidth,
      vw,
      offenders: offenders.slice(0, 10),
    };
  });
  expect(res.scrollW).toBeLessThanOrEqual(res.vw);
  expect(res.bodyScrollW).toBeLessThanOrEqual(res.vw);
  expect(res.offenders).toEqual([]);
});

test('контент соответствует PRD', async ({ page }) => {
  const body = page.locator('main, footer');
  const must = [
    'Анастасия Старшинова',
    'Тренер-технолог реконструкции волос с 2017 года',
    'Идеальная нанопластика',
    'Два теоретических урока',
    'Четыре видеоурока с отработкой разных техник нанопластики',
    'Ссылки на проверенные продукты',
    'Возможность задавать вопросы и получать ответы по материалам курса',
    'Бессрочный доступ к курсу',
    'Поймёте, почему нанопластика могла не получаться раньше',
    'Освоите четыре разные техники нанопластики',
    'добиваться выпрямления с первого раза',
    'Купить курс',
    'База',
    'Девять теоретических онлайн-уроков с демонстрацией процедур на моделях',
    'Первая закупка',
    'Где и как работать легально',
    'Обработка инструментов',
    'Шаблоны договоров и согласий',
    'поиске первых клиентов с пошаговой инструкцией',
    'Бессрочный доступ к теоретическим материалам',
    'Офлайн-практика на выбор: один или два дня',
    'Индивидуально',
    'В мини-группе до шести человек',
    'Узнать подробности',
    'Запись на процедуры',
    'Написать в Telegram',
    'Аренда рабочего места в Москве',
    'Аренда рабочего места в коворкинге в Мытищах',
    'Подробнее об аренде',
  ];
  for (const t of must) await expect(body.getByText(t, { exact: false }).first(), t).toBeAttached();
  await expect(page.locator('.price')).toContainText(/5\s*990/);
  await expect(page.locator('.price')).toContainText('₽');
  await expect(page.getByRole('heading', { level: 2, name: 'Запись на процедуры' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Аренда рабочего места в Москве' })).toBeAttached();
  await expect(page.getByRole('heading', { level: 2, name: 'Аренда рабочего места в коворкинге в Мытищах' })).toBeAttached();
  expect(await page.getByText('Подробнее об аренде').count()).toBe(2);
});

test('нет выдуманных контактов и пустых ссылок', async ({ page }, info) => {
  const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
  for (const h of hrefs) {
    expect(h, 'пустая/заглушечная ссылка').not.toMatch(/^(#|javascript:|)$/);
    if (!h.startsWith('#') && !h.startsWith('./')) expect(h).toMatch(/^https:\/\//);
  }
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/\+7\s?\(?\d{3}/); // телефонов в тексте быть не должно
  // внешние ссылки — ровно те, что дал заказчик, и никаких других
  const exp = expectedLinks(info);
  const external = [...new Set(hrefs.filter((h) => h.startsWith('http')))].sort();
  const allowed = [exp.dev, exp.nano, exp.base, exp.booking, exp.rentMoscow, exp.rentMytishchi, 'https://www.instagram.com/by_anastasiya_star/'];
  if (hasLinks(info)) allowed.push('https://example.com/privacy');
  expect(external).toEqual([...new Set(allowed)].sort());
  expect(await page.getByText('WhatsApp').count(), 'WhatsApp-кнопку убрали').toBe(0);
});

test('фото на месте: грузится, вертикальный кадр 3:4, есть alt', async ({ page }) => {
  const img = page.locator('.photo img');
  await img.scrollIntoViewIfNeeded();
  await expect(img).toHaveAttribute('alt', 'Анастасия Старшинова');
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  const box = await page.locator('.photo__frame').boundingBox();
  expect(box!.height / box!.width).toBeCloseTo(4 / 3, 1);
  await expect(page.locator('.photo__placeholder')).toHaveCount(0);
});

test('кнопки целевых действий: верные ссылки и тексты сообщений', async ({ page }, info) => {
  const exp = expectedLinks(info);
  const check = async (name: string, expected: string, nth = 0) => {
    const el = page.getByRole('link', { name }).nth(nth);
    await expect(el, name).toBeAttached();
    await expect(el).toHaveAttribute('target', '_blank');
    const rel = (await el.getAttribute('rel'))!;
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    await expect(el).toHaveAttribute('href', expected);
  };
  await check('Купить курс', exp.nano);
  await check('Узнать подробности', exp.base);
  await check('Написать в Telegram', exp.booking, 0);
  await check('Написать в Telegram', exp.booking, 1); // дубль в подвале
  // порядок на странице: Москва, затем Мытищи (тексты — по городу, а не по порядку)
  await check('Подробнее об аренде', exp.rentMoscow, 0);
  await check('Подробнее об аренде', exp.rentMytishchi, 1);

  // независимая проверка декодированного текста (не через ту же функцию кодирования)
  const text = async (name: string, nth = 0) =>
    new URL((await page.getByRole('link', { name }).nth(nth).getAttribute('href'))!).searchParams.get('text');
  expect(await text('Узнать подробности')).toBe('Здравствуйте! Меня интересует базовое обучение с нуля «База 3.0»');
  expect(await text('Написать в Telegram')).toBe('Здравствуйте, я хочу записаться');
  expect(await text('Подробнее об аренде', 0)).toBe('Здравствуйте, хочу арендовать кресло в Москве');
  expect(await text('Подробнее об аренде', 1)).toBe('Здравствуйте, хочу арендовать кресло в Мытищах');

  // нет ни одной отключённой кнопки: все ссылки настроены
  await expect(page.locator('main button:disabled, footer button:disabled')).toHaveCount(0);

  const insta = page.locator('footer').getByRole('link', { name: /Instagram/ });
  await expect(insta).toHaveAttribute('href', 'https://www.instagram.com/by_anastasiya_star/');
  expect(await insta.getAttribute('rel')).toContain('noreferrer');

  // подвал: Telegram и Instagram на одном уровне, под ними длинная кнопка
  const promo = page.locator('footer').getByRole('link', { name: /Хотите такой же сайт\?/ });
  await expect(promo).toHaveAttribute('href', exp.dev);
  await expect(promo).toHaveAttribute('target', '_blank');
  expect(await promo.getAttribute('rel')).toContain('noreferrer');
  expect(new URL((await promo.getAttribute('href'))!).searchParams.get('text')).toBe('Здравствуйте, хочу сайт');
  const tgBtn = page.locator('footer').getByRole('link', { name: /Написать в Telegram/ });
  await promo.scrollIntoViewIfNeeded();
  const [a, b, c] = await Promise.all([tgBtn.boundingBox(), insta.boundingBox(), promo.boundingBox()]);
  const sameRow = page.viewportSize()!.width >= 560;
  if (sameRow) {
    expect(Math.abs(a!.y - b!.y), 'Telegram и Instagram на одном уровне').toBeLessThan(2);
    expect(Math.abs(a!.height - b!.height)).toBeLessThan(2);
  }
  expect(c!.y, 'длинная кнопка под ними').toBeGreaterThan(Math.max(a!.y, b!.y) + a!.height - 2);
  expect(c!.width, 'длинная — не уже двух верхних вместе').toBeGreaterThanOrEqual(sameRow ? a!.width + b!.width : a!.width);
  if (hasLinks(info)) {
    await expect(page.getByRole('link', { name: 'Политика обработки персональных данных' })).toHaveAttribute('href', 'https://example.com/privacy');
  }
});

test('якорное меню ведёт к нужным разделам', async ({ page }) => {
  const map: Record<string, string> = { Курсы: '#courses', Процедуры: '#procedures', Аренда: '#rent', Контакты: '#contacts' };
  for (const [label, id] of Object.entries(map)) {
    await page.getByRole('navigation', { name: 'Разделы сайта' }).getByRole('link', { name: label }).click();
    await page.waitForFunction(
      (sel) => {
        const r = document.querySelector(sel)!.getBoundingClientRect();
        return Math.abs(r.top - 56) < 80 || (sel === '#contacts' && r.top < window.innerHeight * 0.8);
      },
      id,
      { timeout: 8000 },
    );
    await expect(page).toHaveURL(new RegExp(`${id}$`));
  }
});

test('клавиатура: фокус виден у шапки и кнопок', async ({ page }) => {
  const seen = new Set<string>();
  // без ссылок кнопки отключены и не фокусируются, поэтому проходим только по гарантированно активным элементам
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return { tag: el.tagName, text: (el.textContent ?? '').trim().slice(0, 30), outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    expect(info, 'фокус потерян').not.toBeNull();
    expect(info!.outline, `нет outline у «${info!.text}»`).not.toBe('none');
    expect(info!.width).toBeGreaterThan(0);
    seen.add(info!.text);
  }
  expect(seen.size).toBeGreaterThan(5);
});

test('история: главы переключаются от скролла, активная видна', async ({ page }) => {
  const story = page.locator('#story');
  const box = await story.evaluate((el) => ({ top: el.getBoundingClientRect().top + window.scrollY, h: (el as HTMLElement).offsetHeight }));
  const vh = page.viewportSize()!.height;
  const total = box.h - vh;
  for (const [i, p] of [[0, 0.1], [1, 0.5], [2, 0.9]] as const) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }), box.top + total * p);
    await expect(page.locator('.story__stage')).toHaveAttribute('data-beat', String(i));
    const active = page.locator('.beat.is-on');
    await expect(active).toHaveCount(1);
    await expect.poll(async () => Number(await active.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThan(0.95);
    // текст главы помещается в экран
    const r = await active.evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(r.top).toBeGreaterThanOrEqual(0);
    expect(r.bottom).toBeLessThanOrEqual(vh);
  }
});

test('холст с волосами рисует и анимируется', async ({ page }, info) => {
  const sample = () =>
    page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>('canvas.hair')!;
      const ctx = c.getContext('2d')!;
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let lit = 0;
      let hash = 0;
      for (let i = 3; i < d.length; i += 4 * 37) {
        if (d[i] > 0) lit++;
        hash = (hash * 31 + d[i]) | 0;
      }
      return { lit, hash, w: c.width, h: c.height };
    });
  await page.waitForTimeout(600);
  const a = await sample();
  expect(a.lit).toBeGreaterThan(200);
  await page.waitForTimeout(700);
  const b = await sample();
  expect(b.hash, 'картинка должна меняться во времени').not.toBe(a.hash);
  // на мобильном DPR ограничен, холст не должен быть огромным
  if (info.project.metadata.viewport === 'mobile') expect(a.w * a.h).toBeLessThan(375 * 812 * 1.5 * 1.5 * 1.2);
});

test('мобильная плашка курса: видна только у блоков курсов на узком экране', async ({ page }, info) => {
  const bar = page.locator('.sticky-cta');
  const narrow = page.viewportSize()!.width < 900;
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
  await expect(bar).not.toHaveClass(/is-on/);
  await page.locator('#courses').evaluate((el) => el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'center' }));
  if (!narrow) {
    await expect(bar).toBeHidden();
    return;
  }
  await expect(bar).toHaveClass(/is-on/);
  await expect(bar).toContainText('Купить курс');
  await expect(bar.getByRole('link', { name: /Купить курс/ })).toHaveAttribute('href', expectedLinks(info).nano);
  await page.locator('#rent-mytishchi').evaluate((el) => el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'center' }));
  await expect(bar).not.toHaveClass(/is-on/);
});

test('кнопки не уже 44px (зона нажатия)', async ({ page }) => {
  await scrollThrough(page);
  const small = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('.btn, .header__nav a, .header__brand'))
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => ({ t: el.textContent!.trim(), h: el.getBoundingClientRect().height }))
      .filter((x) => x.h < 44),
  );
  expect(small).toEqual([]);
});

test('axe: нет нарушений доступности', async ({ page }) => {
  await scrollThrough(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
  await page.waitForTimeout(1800); // дождаться вступительной анимации
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
});

test('prefers-reduced-motion: всё читаемо, анимации не прячут контент', async ({ browser }, info) => {
  const ctx = await browser.newContext({ ...info.project.use, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const hidden = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter((el) => getComputedStyle(el).opacity !== '1').length,
  );
  expect(hidden).toBe(0);
  const ch = await page.locator('.hero__ch').first().evaluate((el) => getComputedStyle(el).opacity);
  expect(ch).toBe('1');
  await scrollThrough(page);
  expect(errors).toEqual([]);
  await ctx.close();
});

test('скриншоты для визуальной проверки', async ({ page }, info) => {
  test.skip(!!process.env.CI, 'только локально');
  const name = info.project.name;
  const sections: [string, string][] = [
    ['hero', '#top'], ['story-1', '#story'], ['about', '.about'], ['nano', '#courses'], ['base', '#base'],
    ['procedures', '#procedures'], ['rent', '#rent'], ['footer', '#contacts'],
  ];
  await scrollThrough(page);
  for (const [label, sel] of sections) {
    await page.locator(sel).first().evaluate((el, end) => el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: end ? 'end' : 'start' }), label === 'footer');
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `test-results/shots/${name}-${label}.png` });
  }
});
