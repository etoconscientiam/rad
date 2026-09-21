import { describe, expect, it } from 'vitest';
import { buildFrame, type Frame, type FrameParams } from './geometry';
import { MODELS } from '@/config/catalog';

const cube: FrameParams = { model: 'cube', ...MODELS.cube.defaults };
const deska: FrameParams = { model: 'deska', ...MODELS.deska.defaults };

/** Габаритная коробка изделия по списку деталей, м. */
function bounds(frame: Frame) {
  const axis = (i: 0 | 1 | 2) => {
    const lo = frame.parts.map((p) => p.position[i] - p.size[i] / 2);
    const hi = frame.parts.map((p) => p.position[i] + p.size[i] / 2);
    return { min: Math.min(...lo), max: Math.max(...hi) };
  };
  return { x: axis(0), y: axis(1), z: axis(2) };
}

describe('buildFrame — cube', () => {
  it('состоит ровно из 12 рёбер', () => {
    expect(buildFrame(cube).parts).toHaveLength(12);
  });

  it('все рёбра металлические, ЛДСП нет', () => {
    expect(buildFrame(cube).parts.every((p) => p.material === 'metal')).toBe(true);
  });

  it('вписан в заданные габариты', () => {
    const f = buildFrame(cube);
    const b = bounds(f);
    expect(b.y.min).toBeCloseTo(0, 6);
    expect(b.y.max).toBeCloseTo(cube.h / 1000, 6);
    expect(b.x.max - b.x.min).toBeCloseTo(cube.w / 1000, 6);
    expect(b.z.max - b.z.min).toBeCloseTo(cube.l / 1000, 6);
  });
});

describe('buildFrame — deska', () => {
  it('4 ноги, 4 царги и одна столешница', () => {
    const f = buildFrame(deska);
    expect(f.parts).toHaveLength(9);
    expect(f.parts.filter((p) => p.material === 'ldsp')).toHaveLength(1);
  });

  it('столешница лежит сверху и закрывает габарит', () => {
    const f = buildFrame(deska);
    const top = f.parts.find((p) => p.material === 'ldsp');
    expect(top).toBeDefined();
    expect(top!.size[0]).toBeCloseTo(deska.w / 1000, 6);
    expect(top!.size[2]).toBeCloseTo(deska.l / 1000, 6);
    expect(bounds(f).y.max).toBeCloseTo(deska.h / 1000, 6);
  });

  it('у Pats есть нижние боковые рамы, у Deska их нет', () => {
    const pats = buildFrame({ ...deska, model: 'pats' });
    expect(pats.parts.length - buildFrame(deska).parts.length).toBe(2);
  });
});

describe('buildFrame — chestable', () => {
  const chestable: FrameParams = {
    model: 'chestable',
    ...MODELS.chestable.defaults,
    drawerExtension: MODELS.chestable.drawerExtension?.default ?? 0,
  };

  it('к столу добавляется тумба: каркас, два корпуса, фасады и ручки', () => {
    const table = buildFrame({ ...chestable, model: 'pats' });
    const withDrawers = buildFrame(chestable);
    expect(withDrawers.parts.length - table.parts.length).toBe(14);
  });

  it('ручки — отдельный материал, их ровно две', () => {
    expect(buildFrame(chestable).parts.filter((p) => p.material === 'knob')).toHaveLength(2);
  });

  /** Столешница — единственный лист ЛДСП во всю ширину изделия. */
  const tabletopOf = (f: Frame, widthMm: number) =>
    f.parts.find((p) => p.material === 'ldsp' && Math.abs(p.size[0] - widthMm / 1000) < 1e-9)!;

  it('тумба висит под столешницей, а не торчит сквозь неё', () => {
    const f = buildFrame(chestable);
    const top = tabletopOf(f, chestable.w);
    const underTop = top.position[1] - top.size[1] / 2;
    for (const part of f.parts) {
      if (part === top) continue;
      expect(part.position[1] + part.size[1] / 2).toBeLessThanOrEqual(underTop + 1e-9);
    }
  });

  it('вынос ящика удлиняет тумбу', () => {
    const drawerDepth = (extension: number) => {
      const f = buildFrame({ ...chestable, drawerExtension: extension });
      const top = tabletopOf(f, chestable.w);
      return Math.max(
        ...f.parts.filter((p) => p.material === 'ldsp' && p !== top).map((p) => p.size[2]),
      );
    };
    expect(drawerDepth(200)).toBeGreaterThan(drawerDepth(0));
  });
});

describe('buildFrame — stella', () => {
  const stella: FrameParams = {
    model: 'stella',
    ...MODELS.stella.defaults,
    shelfStep: MODELS.stella.shelfStep?.default ?? 300,
  };

  it('четыре стойки и пять полок с рамами', () => {
    const f = buildFrame(stella);
    expect(f.parts).toHaveLength(4 + 5 * 5);
    expect(f.parts.filter((p) => p.material === 'ldsp')).toHaveLength(5);
  });

  it('высота считается из шага полок, а не берётся из ввода', () => {
    const p = stella.profile / 1000;
    const step = 300 / 1000;
    const expected = 5 * (p + 0.02) + 4 * step;
    expect(buildFrame({ ...stella, shelfStep: 300 }).height).toBeCloseTo(expected, 9);
  });

  it('шире шаг — выше стеллаж', () => {
    const low = buildFrame({ ...stella, shelfStep: 280 });
    const high = buildFrame({ ...stella, shelfStep: 350 });
    expect(high.height).toBeGreaterThan(low.height);
  });

  it('полки не пересекаются между собой', () => {
    const f = buildFrame(stella);
    const shelves = f.parts
      .filter((p) => p.material === 'ldsp')
      .map((p) => ({ lo: p.position[1] - p.size[1] / 2, hi: p.position[1] + p.size[1] / 2 }))
      .sort((a, b) => a.lo - b.lo);
    for (let i = 1; i < shelves.length; i++) {
      expect(shelves[i]!.lo).toBeGreaterThanOrEqual(shelves[i - 1]!.hi - 1e-9);
    }
  });
});

describe('buildFrame — границы диапазонов', () => {
  it('stella строится на всех крайних сочетаниях', () => {
    const m = MODELS.stella;
    for (const w of [m.ranges.w.min, m.ranges.w.max]) {
      for (const l of [m.ranges.l.min, m.ranges.l.max]) {
        for (const step of [m.shelfStep!.min, m.shelfStep!.max]) {
          for (const profile of [20, 40] as const) {
            const f = buildFrame({ model: 'stella', h: 0, w, l, profile, shelfStep: step });
            for (const part of f.parts) {
              for (const size of part.size) {
                expect(size, `stella ${w}×${l} шаг ${step} профиль ${profile}`).toBeGreaterThan(0);
              }
            }
          }
        }
      }
    }
  });

  it('не даёт отрицательных или нулевых деталей на краях диапазона', () => {
    for (const code of ['cube', 'deska', 'pats', 'chestable'] as const) {
      const m = MODELS[code];
      for (const h of [m.ranges.h.min, m.ranges.h.max]) {
        for (const w of [m.ranges.w.min, m.ranges.w.max]) {
          for (const l of [m.ranges.l.min, m.ranges.l.max]) {
            for (const profile of [20, 40] as const) {
              const f = buildFrame({
                model: code,
                h,
                w,
                l,
                profile,
                drawerExtension: MODELS[code].drawerExtension?.max,
              });
              for (const part of f.parts) {
                for (const s of part.size) {
                  expect(s, `${code} ${h}×${w}×${l} профиль ${profile}`).toBeGreaterThan(0);
                  expect(Number.isFinite(s)).toBe(true);
                }
              }
            }
          }
        }
      }
    }
  });
});
