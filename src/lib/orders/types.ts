/**
 * Приём заявки — за интерфейсом. Todoist это одна реализация;
 * в M2 рядом встанет запись в базу, и вызывающий код не изменится.
 */

import type { ModelCode } from '@/config/catalog';
import type { DeliveryMethod } from '@/lib/price';
import type { Locale } from '@/config/locales';
import type { Profile } from '@/config/pricing';

/** То, что присылает клиент. Цену отсюда не берём — пересчитываем на сервере. */
export type OrderDraft = {
  model: ModelCode;
  h: number;
  w: number;
  l: number;
  profile: Profile;
  qty: number;
  metalColor: string;
  ldspColor?: string;
  customer: {
    /** Единственное обязательное поле связи. */
    phone: string;
    name?: string;
    email?: string;
    comment?: string;
  };
  delivery: { method: DeliveryMethod; address?: string };
  locale: Locale;
};

/** Заявка с ценой, пересчитанной на сервере. Только её и отправляем мастеру. */
export type Order = OrderDraft & {
  price: {
    unitPrice: number;
    total: number;
    deliveryFee: number;
    grandTotal: number;
    profileMeters: number;
    weightKg: number;
    isEstimate: boolean;
    leadTime: { fromDays: number; toDays: number };
  };
};

export type OrderReceipt = {
  /** Идентификатор в системе приёмника, если он его вернул. */
  ref?: string;
  url?: string;
};

/** Куда уходит заявка. Реализации: Todoist сейчас, база позже. */
export interface OrderSink {
  readonly name: string;
  submit(order: Order): Promise<OrderReceipt>;
}
