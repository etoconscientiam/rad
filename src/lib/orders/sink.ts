/**
 * Выбор приёмника заявок по окружению. Отдельно от маршрута: маршрут в Next
 * не может экспортировать ничего, кроме обработчиков, а это надо проверять.
 */

import { TodoistSink } from './todoist';
import type { OrderSink } from './types';

/**
 * Приёмник не настроен — заявка обязана упасть громко. Тихо потерянная
 * заявка хуже честной ошибки: клиент хотя бы позвонит.
 */
const notConfigured: OrderSink = {
  name: 'не настроен',
  submit: async () => {
    throw new Error('TODOIST_TOKEN не задан — заявку отправлять некуда');
  },
};

/** Разрешается на каждый запрос: токен читается из окружения, не из сборки. */
export function resolveSink(): OrderSink {
  const token = process.env.TODOIST_TOKEN;
  if (!token) return notConfigured;
  return new TodoistSink({
    token,
    projectId: process.env.TODOIST_PROJECT_ID,
    sectionId: process.env.TODOIST_SECTION_ID,
  });
}
