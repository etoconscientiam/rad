/**
 * Расчёт цены, веса, метража и сроков. Чистые функции без React и без сети:
 * этот же модуль пойдёт на сервер в M3, когда появится настоящий заказ
 * с обязательной серверной проверкой суммы.
 *
 * Формулы — docs/02-domain-model.md. Ни одной ставки здесь нет,
 * все числа приходят из config/pricing.ts.
 */

import type { ModelCode } from '@/config/catalog';
import {
  DELIVERY,
  EXTRAS,
  LDSP,
  LEAD_TIMES,
  PRICE_IS_ESTIMATE,
  PROFILE_RATES,
  THIN_PROFILE_WARNING,
  type Profile,
} from '@/config/pricing';

export type PriceInput = {
  model: ModelCode;
  /** Габариты в миллиметрах. */
  h: number;
  w: number;
  l: number;
  profile: Profile;
  qty: number;
};

export type Price = {
  /** Погонный метраж профиля, м. */
  profileMeters: number;
  /** Площадь ЛДСП, м². */
  ldspArea: number;
  weightKg: number;
  /** Цена за штуку, ₾. */
  unitPrice: number;
  /** Цена за всё количество, ₾. */
  total: number;
  /** Тарифы владельцем письменно не подтверждены — цена ориентировочная. */
  isEstimate: boolean;
  /** Тонкий профиль на крупном габарите: рекомендуем сечение потолще. */
  suggestThickerProfile: boolean;
};

export type DeliveryMethod = 'pickup' | 'delivery';

const TABLE_MODELS: readonly ModelCode[] = ['deska', 'pats', 'chestable'];

/** Метраж профиля и площадь ЛДСП по модели и габаритам. */
function materials(model: ModelCode, h: number, w: number, l: number) {
  if (TABLE_MODELS.includes(model)) {
    // У Pats и Chestable добавляются замкнутые боковые рамы.
    const extra = model === 'deska' ? 0 : 2 * w;
    return {
      profileMeters: (4 * h + 2 * (w + l) + extra) / 1000,
      ldspArea: (w * l) / 1e6,
    };
  }
  if (model === 'cube') {
    return { profileMeters: (4 * (h + w + l)) / 1000, ldspArea: 0 };
  }
  // Stella считается от шага полок, а не от заданной высоты, и в спринт не входит.
  throw new Error(`Расчёт для модели «${model}» ещё не реализован`);
}

export function calculatePrice({ model, h, w, l, profile, qty }: PriceInput): Price {
  const rate = PROFILE_RATES[profile];
  const { profileMeters, ldspArea } = materials(model, h, w, l);

  const unitPrice = Math.round(
    profileMeters * rate.pricePerMeter + ldspArea * LDSP.pricePerSqm + EXTRAS.painting + EXTRAS.labor,
  );

  return {
    profileMeters,
    ldspArea,
    weightKg: profileMeters * rate.kgPerMeter + ldspArea * LDSP.kgPerSqm,
    unitPrice,
    total: unitPrice * qty,
    isEstimate: PRICE_IS_ESTIMATE,
    suggestThickerProfile:
      profile === THIN_PROFILE_WARNING.profile &&
      Math.max(h, w, l) > THIN_PROFILE_WARNING.maxDimensionMm,
  };
}

/** Срок изготовления в днях по количеству позиций. */
export function leadTime(qty: number): { fromDays: number; toDays: number } {
  const tier = LEAD_TIMES.find((t) => qty <= t.maxQty) ?? LEAD_TIMES[LEAD_TIMES.length - 1]!;
  return { fromDays: tier.fromDays, toDays: tier.toDays };
}

/** Доставка по Тбилиси: базовый тариф плюс надбавки по количеству. */
export function deliveryFee(qty: number, method: DeliveryMethod): number {
  if (method === 'pickup') return DELIVERY.pickup;
  return DELIVERY.tiers.reduce<number>(
    (fee, tier) => (qty > tier.overQty ? fee + tier.surcharge : fee),
    DELIVERY.base,
  );
}
