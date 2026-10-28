/**
 * Процедурные «роскошные волосы» на Canvas 2D — вместо тяжёлых картинок/видео/WebGL.
 * Сотня прядей-линий, которые течут волной; при скролле они «расчёсываются»
 * (параметр straight) и перетекают из одного состояния в другое.
 * Весь рендер — один requestAnimationFrame, ~3 вызова stroke() на кадр.
 */

export interface HairState {
  /** Амплитуда волны, 0..1.2 */
  amp: number;
  /** Выпрямленность, 0 (локоны) … 1 (идеально гладкие) */
  straight: number;
  /** Скорость течения */
  speed: number;
  /** Смещение ленты поперёк потока, доля размера экрана (-0.5..0.5) */
  band: number;
  /** Толщина ленты, 0..1 */
  spread: number;
  /** Общая яркость */
  alpha: number;
}

export const HAIR_PRESETS: Record<string, HairState> = {
  hero: { amp: 1.0, straight: 0, speed: 1.0, band: -0.04, spread: 0.55, alpha: 1 },
  story: { amp: 0.95, straight: 0, speed: 0.8, band: 0, spread: 0.5, alpha: 0.9 },
  about: { amp: 0.6, straight: 0.9, speed: 0.4, band: 0.12, spread: 0.42, alpha: 0.5 },
  nano: { amp: 0.8, straight: 0.92, speed: 0.35, band: 0.14, spread: 0.45, alpha: 0.5 },
  base: { amp: 0.7, straight: 0.55, speed: 0.5, band: -0.12, spread: 0.5, alpha: 0.5 },
  procedures: { amp: 1.15, straight: 0, speed: 1.0, band: 0.02, spread: 0.6, alpha: 0.85 },
  rent: { amp: 0.55, straight: 0.3, speed: 0.4, band: 0.1, spread: 0.45, alpha: 0.4 },
  contacts: { amp: 0.85, straight: 0, speed: 0.7, band: 0.18, spread: 0.55, alpha: 0.6 },
};

interface Options {
  mobile: boolean;
  reduced: boolean;
}

const GROUPS = [
  { color: '216,191,143', a: 0.26 },
  { color: '184,130,90', a: 0.2 },
  { color: '240,230,210', a: 0.14 },
];

/** Ступени адаптивного качества: доля прядей и множитель разрешения. */
const QUALITY = [
  { strands: 1, res: 1 },
  { strands: 0.7, res: 0.9 },
  { strands: 0.5, res: 0.75 },
  { strands: 0.38, res: 0.6 },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export class HairRenderer {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private L = 0;
  private P = 0;
  private angle = 0;
  private readonly N: number;
  private readonly M: number;
  private seeds: Float32Array;
  private cur: HairState = { ...HAIR_PRESETS.hero };
  private target: HairState = { ...HAIR_PRESETS.hero };
  private sweepActive = 0;
  private sweepActiveTarget = 0;
  private sweepX = 0;
  private sweepXTarget = 0;
  private time = 0;
  private quality = 0;
  private activeN = 0;
  // предвычисленные по точкам вдоль потока массивы
  private sArr: Float32Array;
  private hwArr: Float32Array;
  private cyArr: Float32Array;
  private envArr: Float32Array;
  private xArr: Float32Array;
  private s1: Float32Array;
  private c1: Float32Array;
  private s2: Float32Array;
  private c2: Float32Array;

  constructor(private canvas: HTMLCanvasElement, private opts: Options) {
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) throw new Error('Canvas 2D недоступен');
    this.ctx = ctx;
    this.N = opts.mobile ? 44 : 84;
    this.M = opts.mobile ? 30 : 52;
    this.seeds = new Float32Array(this.N);
    for (let i = 0; i < this.N; i++) this.seeds[i] = Math.random() * 2 - 1;
    this.sArr = new Float32Array(this.M + 1);
    this.hwArr = new Float32Array(this.M + 1);
    this.cyArr = new Float32Array(this.M + 1);
    this.envArr = new Float32Array(this.M + 1);
    this.xArr = new Float32Array(this.M + 1);
    this.s1 = new Float32Array(this.M + 1);
    this.c1 = new Float32Array(this.M + 1);
    this.s2 = new Float32Array(this.M + 1);
    this.c2 = new Float32Array(this.M + 1);
    this.resize();
  }

  get width() {
    return this.w;
  }

  /** Текущий уровень деградации качества (0 — максимум). */
  get level() {
    return this.quality;
  }

  /**
   * Снижает качество: меньше прядей и ниже разрешение холста.
   * Линии тонкие и «мягкие», поэтому потеря резкости почти незаметна, а fill-rate падает кратно.
   */
  degrade(): boolean {
    if (this.quality >= QUALITY.length - 1) return false;
    this.quality++;
    this.resize(true);
    return true;
  }

  /** Возвращает true, если размер действительно изменился (игнорирует «дёрганье» адресной строки). */
  resize(force = false): boolean {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    if (!force && this.w && w === this.w && Math.abs(h - this.h) < 160) return false;
    this.w = w;
    this.h = h;
    const q = QUALITY[this.quality];
    // база: десктоп — не выше 1.25, телефон — 0.85 (CSS растягивает холст, линии остаются плавными)
    const base = this.opts.mobile ? 0.85 : Math.min(window.devicePixelRatio || 1, 1.25);
    this.dpr = base * q.res;
    this.activeN = Math.max(12, Math.round(this.N * q.strands));
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    const portrait = h > w;
    this.angle = ((portrait ? 78 : 14) * Math.PI) / 180;
    this.L = Math.hypot(w, h) * 1.06;
    this.P = portrait ? w * 1.15 : h;
    return true;
  }

  setTarget(state: HairState, snap = false) {
    this.target = state;
    if (snap) this.cur = { ...state };
  }

  /** p — прогресс «истории» 0..1 либо null, если вне её. */
  setSweep(p: number | null, snap = false) {
    if (p === null) {
      this.sweepActiveTarget = 0;
    } else {
      this.sweepActiveTarget = 1;
      this.sweepXTarget = (-0.62 + 1.24 * clamp(p, 0, 1)) * this.L;
    }
    if (snap) {
      this.sweepActive = this.sweepActiveTarget;
      this.sweepX = this.sweepXTarget;
    }
  }

  frame(dt: number, snap = false) {
    const k = snap ? 1 : 1 - Math.exp(-dt * 2.4);
    const c = this.cur;
    const t = this.target;
    c.amp += (t.amp - c.amp) * k;
    c.straight += (t.straight - c.straight) * k;
    c.speed += (t.speed - c.speed) * k;
    c.band += (t.band - c.band) * k;
    c.spread += (t.spread - c.spread) * k;
    c.alpha += (t.alpha - c.alpha) * k;
    const ks = snap ? 1 : 1 - Math.exp(-dt * 5);
    this.sweepActive += (this.sweepActiveTarget - this.sweepActive) * ks;
    this.sweepX += (this.sweepXTarget - this.sweepX) * ks;
    if (!this.opts.reduced) this.time += dt;
    this.draw();
  }

  private draw() {
    const { ctx, w, h, dpr, L, P, M } = this;
    const n = this.activeN;
    const c = this.cur;
    const time = this.time;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(this.angle);
    // ровно 1 device-px: Skia рисует такие линии быстрым «волосяным» путём
    const hair = 1 / dpr;

    // --- профиль вдоль потока (синусы считаем один раз на точку, а не на каждую прядь) ---
    const sweepSoft = 0.1 * L;
    const sp = c.speed;
    for (let j = 0; j <= M; j++) {
      const u = j / M;
      const x = (u - 0.5) * L;
      const comb = this.sweepActive * (1 - smoothstep(this.sweepX - sweepSoft, this.sweepX + sweepSoft, x));
      const s = Math.max(c.straight, comb);
      const hwWavy = P * c.spread * (0.55 + 0.45 * Math.sin(u * 2.6 + 0.8));
      const hwFlat = P * c.spread * 0.62;
      this.xArr[j] = x;
      this.sArr[j] = s;
      this.hwArr[j] = hwWavy + (hwFlat - hwWavy) * s;
      this.cyArr[j] = c.band * P + P * 0.08 * Math.sin(u * 2.1 + time * 0.12 * sp) * (1 - s);
      this.envArr[j] = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(u * 3.2 - 0.6))) * (1 - s);
      const a1 = u * 7 - time * sp * 1.1;
      const a2 = u * 15 + time * sp * 1.9;
      this.s1[j] = Math.sin(a1);
      this.c1[j] = Math.cos(a1);
      this.s2[j] = Math.sin(a2);
      this.c2[j] = Math.cos(a2);
    }

    const A = P * 0.11 * c.amp;
    const { xArr, cyArr, hwArr, envArr, s1, c1, s2, c2 } = this;
    ctx.lineWidth = hair;

    for (let g = 0; g < GROUPS.length; g++) {
      const grp = GROUPS[g];
      ctx.beginPath();
      for (let i = g; i < n; i += GROUPS.length) {
        const o = (i / (n - 1)) * 2 - 1;
        const sd = this.seeds[i];
        // sin(a + b) = sin a·cos b + cos a·sin b — без sin() в горячем цикле
        const b1 = o * 1.3 + sd * 0.35;
        const b2 = o * 3.1 + sd * 0.8;
        const sb1 = Math.sin(b1);
        const cb1 = Math.cos(b1);
        const sb2 = Math.sin(b2);
        const cb2 = Math.cos(b2);
        for (let j = 0; j <= M; j++) {
          const w1 = s1[j] * cb1 + c1[j] * sb1;
          const w2 = (s2[j] * cb2 + c2[j] * sb2) * 0.22;
          const y = cyArr[j] + o * hwArr[j] + A * (w1 + w2) * envArr[j];
          if (j === 0) ctx.moveTo(xArr[j], y);
          else ctx.lineTo(xArr[j], y);
        }
      }
      ctx.strokeStyle = `rgba(${grp.color},${Math.min(1, grp.a * 1.3 * c.alpha).toFixed(3)})`;
      ctx.stroke();
    }

    // --- «гребень»: линия, расчёсывающая волосы по мере скролла истории ---
    if (this.sweepActive > 0.02) {
      const a = this.sweepActive;
      const x = this.sweepX;
      const half = P * 0.62;
      const grad = ctx.createLinearGradient(x, -half, x, half);
      grad.addColorStop(0, 'rgba(240,220,174,0)');
      grad.addColorStop(0.5, `rgba(240,220,174,${(0.55 * a).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(240,220,174,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, -half);
      ctx.lineTo(x, half);
      ctx.stroke();
      ctx.strokeStyle = `rgba(240,220,174,${(0.22 * a).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const step = this.opts.mobile ? 22 : 14;
      for (let y = -half * 0.8; y < half * 0.8; y += step) {
        ctx.moveTo(x, y);
        ctx.lineTo(x - 14, y);
      }
      ctx.stroke();
    }
  }
}
