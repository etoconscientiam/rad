import { describe, expect, it } from 'vitest';
import { createOrderHandler } from './handler';
import type { Order, OrderSink } from './types';
import { MODELS } from '@/config/catalog';

const draft = {
  model: 'deska',
  ...MODELS.deska.defaults,
  qty: 2,
  metalColor: 'black',
  ldspColor: 'light',
  customer: { phone: '+995 555 12 34 56' },
  delivery: { method: 'pickup' },
  locale: 'ru',
};

function fakeSink() {
  const received: Order[] = [];
  const sink: OrderSink = {
    name: 'fake',
    submit: async (order) => {
      received.push(order);
      return { ref: 'T-1' };
    },
  };
  return { sink, received };
}

const post = (body: unknown) =>
  new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('приём заявки', () => {
  it('корректная заявка принимается и уходит в приёмник', async () => {
    const { sink, received } = fakeSink();
    const res = await createOrderHandler(sink)(post(draft));
    expect(res.status).toBe(200);
    expect(received).toHaveLength(1);
    await expect(res.json()).resolves.toMatchObject({ ok: true, ref: 'T-1' });
  });

  it('невалидная заявка не доходит до приёмника', async () => {
    const { sink, received } = fakeSink();
    const res = await createOrderHandler(sink)(post({ ...draft, customer: { phone: '' } }));
    expect(res.status).toBe(400);
    expect(received).toHaveLength(0);
    await expect(res.json()).resolves.toMatchObject({ errors: ['phone'] });
  });

  it('цену с клиента не берём, а считаем сами', async () => {
    const { sink, received } = fakeSink();
    // Клиент подсовывает свою сумму — она обязана быть проигнорирована.
    await createOrderHandler(sink)(post({ ...draft, price: { unitPrice: 1, total: 1 } }));
    const order = received[0]!;
    // deska 730×600×1400, профиль 20 → 271 ₾ за штуку, две штуки.
    expect(order.price.unitPrice).toBe(271);
    expect(order.price.total).toBe(542);
    expect(order.price.grandTotal).toBe(542);
  });

  it('доставка попадает в итог', async () => {
    const { sink, received } = fakeSink();
    await createOrderHandler(sink)(
      post({ ...draft, delivery: { method: 'delivery', address: 'ул. Бахтриони 5' } }),
    );
    const order = received[0]!;
    expect(order.price.deliveryFee).toBe(30);
    expect(order.price.grandTotal).toBe(order.price.total + 30);
  });

  it('оговорка про ориентировочную цену едет вместе с заявкой', async () => {
    const { sink, received } = fakeSink();
    await createOrderHandler(sink)(post(draft));
    expect(received[0]!.price.isEstimate).toBe(true);
  });

  it('отказ приёмника не выглядит как успех', async () => {
    const sink: OrderSink = {
      name: 'broken',
      submit: async () => {
        throw new Error('Todoist отказал');
      },
    };
    const res = await createOrderHandler(sink)(post(draft));
    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toMatchObject({ ok: false });
  });

  it('битый JSON не роняет обработчик', async () => {
    const { sink } = fakeSink();
    const res = await createOrderHandler(sink)(
      new Request('http://localhost/api/orders', { method: 'POST', body: 'не json' }),
    );
    expect(res.status).toBe(400);
  });
});
