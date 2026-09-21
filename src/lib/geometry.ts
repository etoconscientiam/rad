/**
 * Построитель каркаса: параметры изделия → список коробок в метрах.
 * Порт `_source/prototype/Frame3D.js` (функция rebuild), геометрия не менялась.
 *
 * Чистая функция без three.js: её можно проверить тестами и переиспользовать
 * на сервере. Рендер живёт отдельно, в components/configurator/Frame3D.tsx.
 *
 * Добавление модели = ветка здесь плюс запись в config/catalog.ts.
 */

import type { ModelCode } from '@/config/catalog';
import type { Profile } from '@/config/pricing';

export type PartMaterial = 'metal' | 'ldsp';

/** Коробка сцены. Все величины в метрах, начало координат — центр пола изделия. */
export type Part = {
  size: readonly [number, number, number];
  position: readonly [number, number, number];
  material: PartMaterial;
};

export type FrameParams = {
  model: ModelCode;
  /** Габариты в миллиметрах. */
  h: number;
  w: number;
  l: number;
  profile: Profile;
};

export type Frame = {
  parts: Part[];
  /** Фактическая высота изделия в метрах — камера и тень считаются от неё. */
  height: number;
};

/** Толщина листа ЛДСП, м. Значение прототипа. */
const LDSP_THICKNESS = 0.02;

const TABLE_MODELS: readonly ModelCode[] = ['deska', 'pats', 'chestable'];

export function buildFrame({ model, h, w, l, profile }: FrameParams): Frame {
  const p = profile / 1000;
  const W = w / 1000;
  const H = h / 1000;
  const L = l / 1000;

  const parts: Part[] = [];
  const add = (
    size: readonly [number, number, number],
    position: readonly [number, number, number],
    material: PartMaterial = 'metal',
  ) => parts.push({ size, position, material });

  const hx = (W - p) / 2;
  const hz = (L - p) / 2;

  if (TABLE_MODELS.includes(model)) {
    const t = LDSP_THICKNESS;
    // Металл доходит до низа столешницы, а не до заявленной высоты.
    const fh = Math.max(H - t, p * 2);

    for (const ix of [-1, 1]) {
      for (const iz of [-1, 1]) add([p, fh, p], [ix * hx, fh / 2, iz * hz]);
    }
    for (const iz of [-1, 1]) add([W - 2 * p, p, p], [0, fh - p / 2, iz * hz]);
    for (const ix of [-1, 1]) add([p, p, L - 2 * p], [ix * hx, fh - p / 2, 0]);

    // Замкнутые боковые рамы — отличие Pats и Chestable от Deska.
    if (model !== 'deska') {
      for (const iz of [-1, 1]) add([W - 2 * p, p, p], [0, p / 2, iz * hz]);
    }

    add([W, t, L], [0, fh + t / 2, 0], 'ldsp');
    return { parts, height: H };
  }

  // cube: голый параллелепипед из 12 рёбер.
  for (const ix of [-1, 1]) {
    for (const iz of [-1, 1]) add([p, H, p], [ix * hx, H / 2, iz * hz]);
  }
  for (const y of [p / 2, H - p / 2]) {
    for (const iz of [-1, 1]) add([W - 2 * p, p, p], [0, y, iz * hz]);
    for (const ix of [-1, 1]) add([p, p, L - 2 * p], [ix * hx, y, 0]);
  }
  return { parts, height: H };
}

/** Габаритный размер изделия, м — для дистанции камеры и размера тени. */
export function frameExtent(frame: Frame, w: number, l: number) {
  return Math.max(w / 1000, frame.height, l / 1000);
}
