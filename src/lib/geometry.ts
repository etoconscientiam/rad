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

export type PartMaterial = 'metal' | 'ldsp' | 'knob';

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
  /** Stella: шаг между полками, мм. Высота изделия считается из него. */
  shelfStep?: number;
  /** Chestable: вынос ящика, мм. */
  drawerExtension?: number;
};

export type Frame = {
  parts: Part[];
  /** Фактическая высота изделия в метрах — камера и тень считаются от неё. */
  height: number;
};

/** Толщина листа ЛДСП, м. Значение прототипа. */
const LDSP_THICKNESS = 0.02;

/** Число полок у Stella. */
const STELLA_SHELVES = 5;

/**
 * Размеры тумбы Chestable в метрах — все из прототипа.
 * Ящик собирают из профиля 15×15, поэтому сечение тут своё.
 */
const DRAWER = {
  profile: 0.015,
  maxHeight: 0.41,
  /** Запас от низа царги до верха тумбы. */
  headroom: 0.08,
  baseDepth: 0.45,
  maxExtension: 0.2,
  /** Отступ тумбы от края стола по длине. */
  inset: 0.1,
  /** Доля полуширины стола, которую занимает тумба. */
  widthShare: 0.7,
  boxHeight: 0.175,
  boxGap: 0.028,
  frontThickness: 0.018,
  knob: 0.026,
} as const;

const TABLE_MODELS: readonly ModelCode[] = ['deska', 'pats', 'chestable'];

export function buildFrame({
  model,
  h,
  w,
  l,
  profile,
  shelfStep,
  drawerExtension,
}: FrameParams): Frame {
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

    if (model === 'chestable') {
      addDrawers({ add, p, fh, hx, hz, L, extension: (drawerExtension ?? 0) / 1000 });
    }

    add([W, t, L], [0, fh + t / 2, 0], 'ldsp');
    return { parts, height: H };
  }

  if (model === 'stella') {
    const t = LDSP_THICKNESS;
    const step = (shelfStep ?? 0) / 1000;
    // Высота у стеллажа не задаётся, а складывается из полок и шага.
    const height = STELLA_SHELVES * (p + t) + (STELLA_SHELVES - 1) * step;

    for (const ix of [-1, 1]) {
      for (const iz of [-1, 1]) add([p, height, p], [ix * hx, height / 2, iz * hz]);
    }
    for (let k = 0; k < STELLA_SHELVES; k++) {
      const base = k * (p + t + step);
      for (const iz of [-1, 1]) add([W - 2 * p, p, p], [0, base + p / 2, iz * hz]);
      for (const ix of [-1, 1]) add([p, p, L - 2 * p], [ix * hx, base + p / 2, 0]);
      add([W, t, L], [0, base + p + t / 2, 0], 'ldsp');
    }
    return { parts, height };
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

type AddPart = (
  size: readonly [number, number, number],
  position: readonly [number, number, number],
  material?: PartMaterial,
) => void;

/**
 * Тумба на два ящика под столешницей Chestable. Порт той же ветки прототипа:
 * каркас из профиля 15×15, два корпуса ЛДСП, фасады и ручки.
 */
function addDrawers({
  add,
  p,
  fh,
  hx,
  hz,
  L,
  extension,
}: {
  add: AddPart;
  p: number;
  fh: number;
  hx: number;
  hz: number;
  L: number;
  extension: number;
}) {
  const dp = DRAWER.profile;
  const height = Math.min(DRAWER.maxHeight, fh - DRAWER.headroom);
  const ext = Math.max(0, Math.min(extension, DRAWER.maxExtension));
  const depth = Math.min(DRAWER.baseDepth + ext, L - 2 * p - 0.2);

  const cx = (hx - p) * DRAWER.widthShare;
  const zFar = hz - p - DRAWER.inset;
  const zNear = zFar - depth;
  const zCenter = (zNear + zFar) / 2;
  const bottom = fh - height;

  for (const ix of [-1, 1]) {
    for (const z of [zNear, zFar]) add([dp, height, dp], [ix * cx, bottom + height / 2, z]);
  }
  for (const z of [zNear, zFar]) add([2 * cx - dp, dp, dp], [0, bottom + dp / 2, z]);
  for (const ix of [-1, 1]) add([dp, dp, depth - dp], [ix * cx, bottom + dp / 2, zCenter]);

  const boxWidth = 2 * cx - 2 * dp - 0.02;
  const boxDepth = depth - 2 * dp - 0.01;
  const xFront = cx + 0.012;
  const firstY = bottom + dp + 0.008;

  for (const i of [0, 1]) {
    const y = firstY + DRAWER.boxHeight / 2 + i * (DRAWER.boxHeight + DRAWER.boxGap);
    add([boxWidth, DRAWER.boxHeight, boxDepth], [-0.01, y, zCenter], 'ldsp');
    add(
      [DRAWER.frontThickness, DRAWER.boxHeight + 0.012, boxDepth + 0.01],
      [xFront, y, zCenter],
      'ldsp',
    );
    add([DRAWER.knob, DRAWER.knob, DRAWER.knob], [xFront + 0.022, y, zCenter], 'knob');
  }
}
