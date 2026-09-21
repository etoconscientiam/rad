import { describe, expect, it } from 'vitest';
import { ACTIVE_MODELS, MODELS, MODEL_CODES } from './catalog';
import { PROFILE_RATES } from './pricing';
import { DEFAULT_LOCALE, LOCALES } from './locales';

describe('каталог изделий', () => {
  it('значения по умолчанию лежат внутри диапазонов', () => {
    for (const code of MODEL_CODES) {
      const m = MODELS[code];
      for (const axis of ['h', 'w', 'l'] as const) {
        const { min, max } = m.ranges[axis];
        if (min === 0 && max === 0) continue; // stella: высота считается
        expect(m.defaults[axis], `${code}.${axis}`).toBeGreaterThanOrEqual(min);
        expect(m.defaults[axis], `${code}.${axis}`).toBeLessThanOrEqual(max);
      }
    }
  });

  it('у каждой модели есть тариф на профиль по умолчанию', () => {
    for (const code of MODEL_CODES) {
      expect(PROFILE_RATES[MODELS[code].defaults.profile], code).toBeDefined();
    }
  });

  it('в спринт включены ровно Cube и Deska', () => {
    expect(ACTIVE_MODELS).toEqual(['cube', 'deska']);
  });
});

describe('локали', () => {
  it('язык по умолчанию входит в список активных', () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });
});
