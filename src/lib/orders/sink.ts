/**
 * Выбор приёмника заявок по окружению. Отдельно от маршрута: маршрут в Next
 * не может экспортировать ничего, кроме обработчиков, а это надо проверять.
 */

import { SupabaseOrdersSink } from './supabase';
import type { OrderSink } from './types';

/**
 * Приёмник не настроен — заявка обязана упасть громко. Тихо потерянная
 * заявка хуже честной ошибки: клиент хотя бы позвонит.
 */
const notConfigured: OrderSink = {
  name: 'не настроен',
  submit: async () => {
    throw new Error('Supabase не настроен — заявку хранить негде');
  },
};

/** Разрешается на каждый запрос: серверный ключ не попадает в сборку. */
export function resolveSink(): OrderSink {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // SUPABASE_SERVICE_ROLE_KEY оставлен как временная совместимость с
  // устаревшими JWT-ключами Supabase. Для новых проектов используем secret.
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return notConfigured;
  return new SupabaseOrdersSink({
    url,
    secretKey,
  });
}
