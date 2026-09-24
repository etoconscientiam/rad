import { describe, expect, it } from 'vitest';
import { SupabaseOrdersSink } from './supabase';
import type { Order } from './types';

const order: Order = {
  requestId: '1a945b6a-7d1d-4aa8-b6d1-492d2d1a9d23',
  model: 'deska',
  h: 730,
  w: 600,
  l: 1400,
  profile: 20,
  qty: 2,
  metalColor: 'black',
  ldspColor: 'light',
  customer: { phone: '+995 555 12 34 56', name: 'Нино' },
  delivery: { method: 'pickup' },
  locale: 'ru',
  quotedTotal: 1,
  price: {
    unitPrice: 271,
    total: 542,
    deliveryFee: 0,
    grandTotal: 542,
    profileMeters: 6.92,
    weightKg: 12.1,
    isEstimate: true,
    leadTime: { fromDays: 7, toDays: 10 },
  },
};

function response(body: unknown, status = 201) {
  return new Response(JSON.stringify(body), { status });
}

describe('приёмник Supabase', () => {
  it('сохраняет серверный снимок заказа, а не клиентскую цену', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const sink = new SupabaseOrdersSink(
      { url: 'https://project.supabase.co/', secretKey: 'sb_secret_test' },
      async (url, init) => {
        calls.push({ url: String(url), init: init! });
        return response([{ id: 'db-1', order_number: 17 }]);
      },
    );

    await expect(sink.submit(order)).resolves.toEqual({ ref: 'db-1' });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe('https://project.supabase.co/rest/v1/orders?on_conflict=request_id');
    expect(calls[0]!.init.headers).toMatchObject({
      apikey: 'sb_secret_test',
      prefer: 'resolution=ignore-duplicates,return=representation',
    });
    expect(calls[0]!.init.headers).not.toHaveProperty('authorization');
    expect(JSON.parse(String(calls[0]!.init.body))).toMatchObject({
      request_id: order.requestId,
      source: 'web',
      status: 'received',
      configuration: { model: 'deska', qty: 2 },
      pricing: { grandTotal: 542 },
    });
    expect(JSON.parse(String(calls[0]!.init.body))).not.toHaveProperty('quoted_total');
  });

  it('при повторе того же request id возвращает уже созданный заказ', async () => {
    const calls: string[] = [];
    const sink = new SupabaseOrdersSink(
      { url: 'https://project.supabase.co', secretKey: 'sb_secret_test' },
      async (url) => {
        calls.push(String(url));
        return calls.length === 1 ? response([]) : response([{ id: 'db-1', order_number: 17 }]);
      },
    );

    await expect(sink.submit(order)).resolves.toEqual({ ref: 'db-1' });
    expect(calls[1]).toContain('request_id=eq.1a945b6a-7d1d-4aa8-b6d1-492d2d1a9d23');
  });

  it('не выдаёт ошибку базы за успешное оформление', async () => {
    const sink = new SupabaseOrdersSink(
      { url: 'https://project.supabase.co', secretKey: 'sb_secret_test' },
      async () => response({ message: 'denied' }, 403),
    );

    await expect(sink.submit(order)).rejects.toThrow(/Supabase ответил 403/);
  });
});
