/**
 * Проверка заявки. Гоняется на сервере и повторно на клиенте — форме нужно
 * подсвечивать поля, но доверяем только серверному прогону.
 */

import { MODELS, type ModelCode } from '@/config/catalog';
import { PROFILE_RATES } from '@/config/pricing';
import type { OrderDraft } from './types';

/** Минимум цифр в телефоне: короче — это не номер. */
const MIN_PHONE_DIGITS = 7;

export type ValidationResult = { errors: string[] };

export function validateDraft(draft: OrderDraft): ValidationResult {
  const errors: string[] = [];

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

  if (!PROFILE_RATES[draft.profile]) errors.push('profile');
  if (!Number.isInteger(draft.qty) || draft.qty < 1) errors.push('qty');

  const digits = (draft.customer?.phone ?? '').replace(/\D/g, '');
  if (digits.length < MIN_PHONE_DIGITS) errors.push('phone');

  if (draft.delivery?.method === 'delivery' && !draft.delivery.address?.trim()) {
    errors.push('address');
  }

  return { errors };
}
