/**
 * Тарифы, диапазоны и сроки — единственный источник правды.
 * Ни одно из этих чисел не должно появиться в компоненте.
 *
 * ВНИМАНИЕ: значения сняты с прототипа (docs/02-domain-model.md), владельцем
 * письменно НЕ подтверждены. Пока PRICE_IS_ESTIMATE === true, цена показывается
 * с оговоркой и оговорка уходит в текст заявки мастеру.
 * Подтвердят прайс — правится этот файл и флаг, компоненты не трогаются.
 */

/** Цена ориентировочная, пока тарифы не подтверждены письменно. */
export const PRICE_IS_ESTIMATE = true;

export const CURRENCY = 'GEL' as const;

/** Сечения профиля, мм. */
export const PROFILES = [20, 30, 40] as const;
export type Profile = (typeof PROFILES)[number];

/** ₾ за погонный метр и кг за погонный метр по сечению. */
export const PROFILE_RATES: Record<Profile, { pricePerMeter: number; kgPerMeter: number }> = {
  20: { pricePerMeter: 18, kgPerMeter: 0.9 },
  30: { pricePerMeter: 26, kgPerMeter: 1.4 },
  40: { pricePerMeter: 36, kgPerMeter: 2.0 },
};

/** ЛДСП: ₾ за м² и кг за м². */
export const LDSP = { pricePerSqm: 55, kgPerSqm: 11.7 } as const;

/** Надбавки, включённые в цену каждой позиции. */
export const EXTRAS = { painting: 40, labor: 60 } as const;

/** Тумба с ящиками (chestable) — вне спринта, но тариф держим здесь же. */
export const DRAWER = { framePricePerMeter: 14, assembly: 25 } as const;

/**
 * Профиль 20×20 на габарите крупнее порога — рекомендуем 30×30.
 * Это рекомендация, а не запрет: выбор остаётся за клиентом.
 */
export const THIN_PROFILE_WARNING = {
  profile: 20,
  maxDimensionMm: 1500,
  /** Что предлагаем взамен. */
  recommend: 30,
} as const;

/** Доставка по Тбилиси: базовый тариф и надбавки по количеству позиций. */
export const DELIVERY = {
  base: 30,
  tiers: [
    { overQty: 3, surcharge: 20 },
    { overQty: 10, surcharge: 30 },
    { overQty: 50, surcharge: 40 },
  ],
  pickup: 0,
} as const;

/**
 * Потолок количества в одной заявке. Корзины нет, поэтому это и предел формы,
 * и предел серверной проверки — значение одно на оба места.
 */
export const MAX_QTY = 200;

/** Срок изготовления в днях по количеству позиций. */
export const LEAD_TIMES = [
  { maxQty: 5, fromDays: 7, toDays: 10 },
  { maxQty: 20, fromDays: 9, toDays: 13 },
  { maxQty: Infinity, fromDays: 14, toDays: 17 },
] as const;
