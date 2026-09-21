import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/config/locales';
import ka from './ka.json';
import ru from './ru.json';

const DICTIONARIES: Record<string, unknown> = { ka, ru };

function keys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe('словари', () => {
  it('на каждую активную локаль есть файл', () => {
    for (const locale of LOCALES) expect(DICTIONARIES[locale], locale).toBeDefined();
  });

  it('набор ключей совпадает во всех локалях', () => {
    const reference = keys(ru).sort();
    for (const locale of LOCALES) {
      expect(keys(DICTIONARIES[locale]).sort(), `локаль ${locale}`).toEqual(reference);
    }
  });

  it('пустых строк нет', () => {
    for (const locale of LOCALES) {
      const flat = JSON.stringify(DICTIONARIES[locale]);
      expect(flat, `локаль ${locale}`).not.toContain('""');
    }
  });
});
