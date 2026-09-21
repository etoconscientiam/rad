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

describe('buildFrame — границы диапазонов', () => {
  it('не даёт отрицательных или нулевых деталей на краях диапазона', () => {
    for (const code of ['cube', 'deska'] as const) {
      const m = MODELS[code];
      for (const h of [m.ranges.h.min, m.ranges.h.max]) {
        for (const w of [m.ranges.w.min, m.ranges.w.max]) {
          for (const l of [m.ranges.l.min, m.ranges.l.max]) {
            for (const profile of [20, 40] as const) {
              const f = buildFrame({ model: code, h, w, l, profile });
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
