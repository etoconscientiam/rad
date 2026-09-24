/**
 * Обработчик приёма заявки. Живёт отдельно от маршрута, чтобы проверяться
 * тестами без поднятия Next.
 *
 * Главное здесь: цена, присланная клиентом, игнорируется целиком.
 * Сумма считается заново из размеров и тарифов конфига — инвариант проекта
 * (AGENTS.md: «Never trust a client-computed price»).
 */

import { calculatePrice, deliveryFee, leadTime } from '@/lib/price';
import { formatOrderTask } from './format';
import { validateDraft } from './validate';
import type { Order, OrderDraft, OrderSink } from './types';

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** Досчитывает заявку на сервере: клиентские суммы сюда не попадают. */
export function priceOrder(draft: OrderDraft): Order {
  const price = calculatePrice({
    model: draft.model,
    h: draft.h,
    w: draft.w,
    l: draft.l,
    profile: draft.profile,
    qty: draft.qty,
  });
  const fee = deliveryFee(draft.qty, draft.delivery.method);

  return {
    ...draft,
    requestId: draft.requestId ?? crypto.randomUUID(),
    price: {
      unitPrice: price.unitPrice,
      total: price.total,
      deliveryFee: fee,
      grandTotal: price.total + fee,
      profileMeters: price.profileMeters,
      weightKg: price.weightKg,
      isEstimate: price.isEstimate,
      leadTime: leadTime(draft.qty),
    },
  };
}

export function createOrderHandler(sink: OrderSink) {
  return async function handle(request: Request): Promise<Response> {
    let draft: OrderDraft;
    try {
      draft = (await request.json()) as OrderDraft;
    } catch {
      return json({ ok: false, errors: ['body'] }, 400);
    }

    const { errors } = validateDraft(draft);
    if (errors.length) return json({ ok: false, errors }, 400);

    const order = priceOrder(draft);

    // Клиентскую сумму не берём в заказ, но сверяем с ней свою. Расхождение
    // значит, что человек видел не ту цену, на которую соглашается, —
    // это отказ, а не повод тихо подставить другое число.
    if (draft.quotedTotal !== undefined && draft.quotedTotal !== order.price.grandTotal) {
      console.warn(
        `[orders] цена разошлась: клиент показал ${draft.quotedTotal}, сервер насчитал ${order.price.grandTotal}`,
      );
      return json({ ok: false, errors: ['price'], total: order.price.grandTotal }, 409);
    }

    try {
      const receipt = await sink.submit(order);
      return json({ ok: true, ...receipt, total: order.price.grandTotal }, 200);
    } catch (error) {
      // Наружу текст ошибки приёмника не отдаём: в нём может быть токен.
      console.error(`[orders] приёмник ${sink.name} отказал:`, error);
      return json({ ok: false, errors: ['sink'] }, 502);
    }
  };
}

export { formatOrderTask };
