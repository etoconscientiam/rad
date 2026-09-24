/**
 * Проверка заявки. Гоняется на сервере и повторно на клиенте — форме нужно
 * подсвечивать поля, но доверяем только серверному прогону.
 */

import { LDSP_FINISHES, METAL_FINISHES, MODELS, type ModelCode } from '@/config/catalog';
import { isLocale } from '@/config/locales';
import { MAX_QTY, PROFILES } from '@/config/pricing';
import type { OrderDraft } from './types';

/** Минимум цифр в телефоне: короче — это не номер. */
const MIN_PHONE_DIGITS = 7;

/**
 * Потолки свободного текста. Всё это уезжает в задачу мастеру, поэтому длина
 * ограничена: иначе одна заявка превращает наряд в нечитаемую простыню.
 */
const MAX_LENGTH = { name: 120, email: 200, comment: 1000, address: 300 } as const;

const METAL_VALUES: readonly string[] = METAL_FINISHES.map((f) => f.value);
const LDSP_VALUES: readonly string[] = LDSP_FINISHES.map((f) => f.value);
const DELIVERY_METHODS: readonly string[] = ['pickup', 'delivery'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ValidationResult = { errors: string[] };

export function validateDraft(draft: OrderDraft): ValidationResult {
  const errors: string[] = [];

  // null, строка, массив — тоже валидный JSON. Без этой проверки обработчик
  // падал на чтении полей и отдавал 500 вместо 400.
  if (typeof draft !== 'object' || draft === null || Array.isArray(draft)) {
    return { errors: ['body'] };
  }

  const spec = MODELS[draft.model as ModelCode] as (typeof MODELS)[ModelCode] | undefined;
  if (!spec || !spec.enabled) {
    errors.push('model');
    // Без модели диапазоны проверять не по чему.
    return { errors };
  }

  for (const axis of ['h', 'w', 'l'] as const) {
    const { min, max } = spec.ranges[axis];
    const value = draft[axis];
    if (!Number.isFinite(value) || value < min || value > max) errors.push(axis);
  }

  // Именно членство в списке, а не поиск по объекту: 'constructor' и 'toString'
  // проходили проверку как ключи прототипа и уводили цену в NaN.
  if (!(PROFILES as readonly unknown[]).includes(draft.profile)) errors.push('profile');
  if (!Number.isInteger(draft.qty) || draft.qty < 1 || draft.qty > MAX_QTY) errors.push('qty');

  // Отделка приходит строкой и попадает в наряд — принимаем только из каталога.
  if (!METAL_VALUES.includes(draft.metalColor)) errors.push('metalColor');
  if (spec.hasLdsp) {
    // Без цвета наряд уедет мастеру без строки «ЛДСП» — резать нечего.
    if (draft.ldspColor === undefined || !LDSP_VALUES.includes(draft.ldspColor)) {
      errors.push('ldspColor');
    }
  } else if (draft.ldspColor !== undefined) {
    errors.push('ldspColor');
  }

  if (typeof draft.locale !== 'string' || !isLocale(draft.locale)) errors.push('locale');
  if (draft.requestId !== undefined && (typeof draft.requestId !== 'string' || !UUID.test(draft.requestId))) {
    errors.push('requestId');
  }

  const method = draft.delivery?.method;
  if (!DELIVERY_METHODS.includes(method)) {
    errors.push('method');
  } else if (method === 'delivery' && !draft.delivery.address?.trim()) {
    errors.push('address');
  }

  const digits = (draft.customer?.phone ?? '').replace(/\D/g, '');
  if (digits.length < MIN_PHONE_DIGITS) errors.push('phone');

  if ((draft.customer?.name?.length ?? 0) > MAX_LENGTH.name) errors.push('name');
  if ((draft.customer?.email?.length ?? 0) > MAX_LENGTH.email) errors.push('email');
  if ((draft.customer?.comment?.length ?? 0) > MAX_LENGTH.comment) errors.push('comment');
  if ((draft.delivery?.address?.length ?? 0) > MAX_LENGTH.address) errors.push('address');

  return { errors };
}
