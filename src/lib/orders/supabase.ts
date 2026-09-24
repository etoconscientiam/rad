/**
 * Постоянное хранилище заказов через Supabase PostgREST.
 *
 * Не используем клиентскую библиотеку: серверу достаточно стандартного fetch,
 * а секретный ключ остаётся только в серверном окружении Next.js.
 */

import type { Order, OrderReceipt, OrderSink } from './types';

export type SupabaseOrdersConfig = {
  url: string;
  secretKey: string;
};

type StoredOrder = { id?: unknown; order_number?: unknown };

function orderRow(order: Order) {
  return {
    request_id: order.requestId,
    source: 'web',
    status: 'received',
    locale: order.locale,
    customer_name: order.customer.name?.trim() || null,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email?.trim() || null,
    customer_comment: order.customer.comment?.trim() || null,
    delivery_method: order.delivery.method,
    delivery_address: order.delivery.address?.trim() || null,
    configuration: {
      model: order.model,
      h: order.h,
      w: order.w,
      l: order.l,
      profile: order.profile,
      qty: order.qty,
      metalColor: order.metalColor,
      ...(order.ldspColor ? { ldspColor: order.ldspColor } : {}),
    },
    pricing: order.price,
    is_estimate: order.price.isEstimate,
  };
}

function storedId(rows: unknown): string | undefined {
  if (!Array.isArray(rows)) return undefined;
  const id = (rows[0] as StoredOrder | undefined)?.id;
  return typeof id === 'string' ? id : undefined;
}

export class SupabaseOrdersSink implements OrderSink {
  readonly name = 'supabase';
  private readonly baseUrl: string;

  constructor(
    private readonly config: SupabaseOrdersConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {
    this.baseUrl = config.url.replace(/\/$/, '');
  }

  private headers(prefer: string) {
    return {
      // Новые ключи sb_secret_* не являются JWT: Supabase принимает их
      // исключительно в apikey, а не в Authorization: Bearer.
      apikey: this.config.secretKey,
      'content-type': 'application/json',
      prefer,
    };
  }

  private async fail(response: Response): Promise<never> {
    const detail = (await response.text().catch(() => '')).slice(0, 200).trim();
    throw new Error(`Supabase ответил ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  private async findExisting(requestId: string): Promise<string> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/rest/v1/orders?request_id=eq.${encodeURIComponent(requestId)}&select=id,order_number`,
      { headers: this.headers('return=representation') },
    );
    if (!response.ok) return this.fail(response);
    const id = storedId(await response.json().catch(() => null));
    if (!id) throw new Error('Supabase не вернул сохранённый заказ');
    return id;
  }

  async submit(order: Order): Promise<OrderReceipt> {
    const response = await this.fetchImpl(`${this.baseUrl}/rest/v1/orders?on_conflict=request_id`, {
      method: 'POST',
      headers: this.headers('resolution=ignore-duplicates,return=representation'),
      body: JSON.stringify(orderRow(order)),
    });
    if (!response.ok) return this.fail(response);

    const id = storedId(await response.json().catch(() => null)) ?? (await this.findExisting(order.requestId));
    return { ref: id };
  }
}
