/**
 * Каталог изделий — данные, не код. Добавление модели = запись здесь плюс ветка
 * в построителе геометрии. Отдельного компонента под модель быть не должно.
 *
 * Диапазоны и значения по умолчанию — из docs/02-domain-model.md (сняты с прототипа).
 * Числа из этого файла и из pricing.ts в компонентах не дублируются.
 */

import { PROFILES, type Profile } from './pricing';

export const MODEL_CODES = ['cube', 'deska', 'pats', 'chestable', 'stella'] as const;
export type ModelCode = (typeof MODEL_CODES)[number];

/** Диапазон размера в миллиметрах. */
export type Range = { min: number; max: number };

export type Model = {
  code: ModelCode;
  /**
   * Входит ли модель в текущий объём. Спринт до 24.09 — только cube и deska
   * (решение владельца 20.09.2026). Возврат остальных = смена флага
   * и ветка геометрии, переписывать ничего не нужно.
   */
  enabled: boolean;
  /** Есть ли столешница или полки из ЛДСП — от этого зависит набор контролов. */
  hasLdsp: boolean;
  ranges: { h: Range; w: Range; l: Range };
  defaults: { h: number; w: number; l: number; profile: Profile };
  /** Stella: шаг между полками, мм. */
  shelfStep?: Range & { default: number };
  /** Chestable: вынос ящика, мм. */
  drawerExtension?: Range & { default: number };
};

const TABLE_RANGES = {
  h: { min: 400, max: 1100 },
  w: { min: 500, max: 1000 },
  l: { min: 800, max: 2200 },
} as const;

const TABLE_DEFAULTS = { h: 730, w: 600, l: 1400, profile: 20 } as const satisfies Model['defaults'];

export const MODELS: Record<ModelCode, Model> = {
  cube: {
    code: 'cube',
    enabled: true,
    hasLdsp: false,
    ranges: {
      h: { min: 200, max: 2000 },
      w: { min: 200, max: 2000 },
      l: { min: 200, max: 2000 },
    },
    defaults: { h: 750, w: 450, l: 1200, profile: 30 },
  },
  deska: {
    code: 'deska',
    enabled: true,
    hasLdsp: true,
    ranges: TABLE_RANGES,
    defaults: TABLE_DEFAULTS,
  },
  pats: {
    code: 'pats',
    enabled: false,
    hasLdsp: true,
    ranges: TABLE_RANGES,
    defaults: TABLE_DEFAULTS,
  },
  chestable: {
    code: 'chestable',
    enabled: false,
    hasLdsp: true,
    ranges: { ...TABLE_RANGES, h: { min: 600, max: 1100 } },
    defaults: TABLE_DEFAULTS,
    drawerExtension: { min: 0, max: 200, default: 0 },
  },
  stella: {
    code: 'stella',
    enabled: false,
    hasLdsp: true,
    // Высота считается из шага полок, поэтому диапазон h здесь не задаётся вводом.
    ranges: {
      h: { min: 0, max: 0 },
      w: { min: 250, max: 500 },
      l: { min: 600, max: 1400 },
    },
    defaults: { h: 0, w: 350, l: 900, profile: 20 },
    shelfStep: { min: 280, max: 350, default: 300 },
  },
};

/** Модели, доступные клиенту прямо сейчас. */
export const ACTIVE_MODELS = MODEL_CODES.filter((code) => MODELS[code].enabled);

/** Шаг слайдеров размера, мм. В прототипе он везде один. */
export const SIZE_STEP = 10;

export const PROFILE_OPTIONS = PROFILES.map((p) => profileLabel(p));

/**
 * Цвет металла. Храним ИМЯ токена, а не готовое значение: в CSS оно уходит как
 * var(--product-black), а в three.js — резолвится через cssVar(), потому что
 * сцена CSS-переменных не понимает. Своей палитры у 3D нет.
 */
export const METAL_FINISHES = [
  { value: 'black', token: '--product-black' },
  { value: 'gray', token: '--product-gray' },
  { value: 'white', token: '--product-white' },
] as const;

/**
 * ЛДСП. tint уходит в 3D, texture — превью свотча и материал сцены.
 * Файлы webp появятся в понедельник (пережим из _source/prototype/textures).
 */
export const LDSP_FINISHES = [
  { value: 'light', tint: '#B4854F', texture: '/textures/wood-light.webp' },
  { value: 'grey', tint: '#6C625B', texture: '/textures/wood-grey.webp' },
  { value: 'dark', tint: '#4B3B34', texture: '/textures/wood-dark.webp' },
] as const;

/** Подпись сечения профиля: 30 → «30×30». */
export function profileLabel(p: Profile): string {
  return `${p}×${p}`;
}

/** Обратное преобразование подписи в сечение. */
export function profileFromLabel(label: string): Profile | undefined {
  return PROFILES.find((p) => profileLabel(p) === label);
}
