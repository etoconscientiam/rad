import { createOrderHandler } from '@/lib/orders/handler';
import { resolveSink } from '@/lib/orders/sink';

export async function POST(request: Request): Promise<Response> {
  return createOrderHandler(resolveSink())(request);
}
