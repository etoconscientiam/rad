import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
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

/** Все ключи, которые код запрашивает через t('...'). */
function usedKeys(dir: string): Array<{ key: string; file: string }> {
  const found: Array<{ key: string; file: string }> = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      found.push(...usedKeys(path));
    } else if (path.endsWith('.tsx')) {
      const source = readFileSync(path, 'utf8');
      // t('group.key') — но не getContext('2d') и не createElement('canvas')
      for (const m of source.matchAll(/(?<![A-Za-z])t\(\s*'([a-z][a-zA-Z0-9]*\.[a-zA-Z0-9_.]+)'\s*\)/g)) {
        found.push({ key: m[1]!, file: path });
      }
    }
  }
  return found;
}

function lookup(dict: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>(
    (cur, part) =>
      typeof cur === 'object' && cur !== null ? (cur as Record<string, unknown>)[part] : undefined,
    dict,
  );
}

describe('ключи, которые запрашивает код', () => {
  it('существуют во всех словарях', () => {
    const missing = usedKeys('src').flatMap(({ key, file }) =>
      LOCALES.filter((l) => lookup(DICTIONARIES[l], key) === undefined).map(
        (l) => `${key} нет в ${l} (${file})`,
      ),
    );
    expect(missing).toEqual([]);
  });
});
