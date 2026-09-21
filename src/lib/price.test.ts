import { describe, expect, it } from 'vitest';
import { calculatePrice, deliveryFee, leadTime } from './price';
import { MODELS } from '@/config/catalog';

/**
 * Эталон — docs/02-domain-model.md, раздел «Проверочные значения».
 * Числа сняты с работающего прототипа 21.09.2026 и перепроверены вручную.
 */
const cube = { model: 'cube' as const, ...MODELS.cube.defaults, qty: 1 };
const deska = { model: 'deska' as const, ...MODELS.deska.defaults, qty: 1 };

describe('цена — сверка с прототипом', () => {
  it('cube 750×450×1200, профиль 30 → 350 ₾', () => {
    const p = calculatePrice({ ...cube, profile: 30 });
    expect(p.profileMeters).toBeCloseTo(9.6, 6);
    expect(p.unitPrice).toBe(350);
  });

  it('cube 750×450×1200, профиль 20 → 273 ₾', () => {
    expect(calculatePrice({ ...cube, profile: 20 }).unitPrice).toBe(273);
  });

  it('deska 730×600×1400, профиль 20 → 271 ₾', () => {
    const p = calculatePrice({ ...deska, profile: 20 });
    expect(p.profileMeters).toBeCloseTo(6.92, 6);
    expect(p.ldspArea).toBeCloseTo(0.84, 6);
    expect(p.unitPrice).toBe(271);
  });

  it('deska 730×600×1400, профиль 30 → 326 ₾', () => {
    expect(calculatePrice({ ...deska, profile: 30 }).unitPrice).toBe(326);
  });
});

describe('цена — состав', () => {
  it('у cube нет ЛДСП', () => {
    expect(calculatePrice(cube).ldspArea).toBe(0);
  });

  it('Pats дороже Deska на две перемычки по ширине', () => {
    const d = calculatePrice({ ...deska, profile: 20 });
    const p = calculatePrice({ ...deska, model: 'pats', profile: 20 });
    expect(p.profileMeters - d.profileMeters).toBeCloseTo((2 * deska.w) / 1000, 6);
    expect(p.unitPrice).toBeGreaterThan(d.unitPrice);
  });

  it('итог умножается на количество', () => {
    const one = calculatePrice({ ...cube, qty: 1 });
    const seven = calculatePrice({ ...cube, qty: 7 });
    expect(seven.total).toBe(one.unitPrice * 7);
  });

  it('цена помечена ориентировочной, пока тарифы не подтверждены', () => {
    expect(calculatePrice(cube).isEstimate).toBe(true);
  });
});

describe('вес', () => {
  it('cube профиль 30: метраж × 1.4 кг', () => {
    expect(calculatePrice({ ...cube, profile: 30 }).weightKg).toBeCloseTo(9.6 * 1.4, 6);
  });

  it('deska профиль 20: металл плюс ЛДСП', () => {
    expect(calculatePrice({ ...deska, profile: 20 }).weightKg).toBeCloseTo(
      6.92 * 0.9 + 0.84 * 11.7,
      6,
    );
  });
});

describe('предупреждение о тонком профиле', () => {
  it('профиль 20 и габарит больше 1500 мм — рекомендуем 30×30', () => {
    const p = calculatePrice({ model: 'cube', h: 1600, w: 450, l: 1200, profile: 20, qty: 1 });
    expect(p.suggestThickerProfile).toBe(true);
  });

  it('тот же габарит на профиле 30 — без предупреждения', () => {
    const p = calculatePrice({ model: 'cube', h: 1600, w: 450, l: 1200, profile: 30, qty: 1 });
    expect(p.suggestThickerProfile).toBe(false);
  });

  it('профиль 20 в пределах 1500 мм — без предупреждения', () => {
    expect(calculatePrice({ ...deska, profile: 20 }).suggestThickerProfile).toBe(false);
  });
});

describe('срок изготовления', () => {
  it.each([
    [1, 7, 10],
    [5, 7, 10],
    [6, 9, 13],
    [20, 9, 13],
    [21, 14, 17],
  ])('%i шт → %i–%i дней', (qty, from, to) => {
    expect(leadTime(qty)).toEqual({ fromDays: from, toDays: to });
  });
});

describe('доставка', () => {
  it('самовывоз бесплатен', () => {
    expect(deliveryFee(1, 'pickup')).toBe(0);
  });

  it.each([
    [1, 30],
    [3, 30],
    [4, 50],
    [10, 50],
    [11, 80],
    [50, 80],
    [51, 120],
  ])('%i шт доставкой → %i ₾', (qty, fee) => {
    expect(deliveryFee(qty, 'delivery')).toBe(fee);
  });
});
