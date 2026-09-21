/**
 * Отправка заявки задачей в Todoist. Одна из реализаций OrderSink —
 * в M2 рядом встанет запись в базу, вызывающий код не поменяется.
 *
 * Токен приходит из окружения и никогда не попадает ни в лог, ни в текст
 * ошибки, ни в ответ клиенту.
 */

import { formatOrderTask } from './format';
import type { Order, OrderReceipt, OrderSink } from './types';

/**
 * REST v2 отключён: 21.09.2026 отдаёт 410 с текстом «This endpoint is
 * deprecated ... please update to /api/v1/». Образец из git-наброска
 * (_source/git-sketch/app/api/order.js) писался под v2 и сейчас нерабочий.
 */
const TODOIST_TASKS_URL = 'https://api.todoist.com/api/v1/tasks';

/** Ссылка на задачу, если API её не вернул. */
const taskUrl = (id: string) => `https://app.todoist.com/app/task/${id}`;

export type TodoistConfig = {
  token: string;
  projectId?: string;
  sectionId?: string;
};

export class TodoistSink implements OrderSink {
  readonly name = 'todoist';

  constructor(
    private readonly config: TodoistConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async submit(order: Order): Promise<OrderReceipt> {
    const { title, description } = formatOrderTask(order);

    const response = await this.fetchImpl(TODOIST_TASKS_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.config.token}`,
      },
      body: JSON.stringify({
        content: title,
        description,
        ...(this.config.projectId ? { project_id: this.config.projectId } : {}),
        ...(this.config.sectionId ? { section_id: this.config.sectionId } : {}),
      }),
    });

    if (!response.ok) {
      // Тело ответа — от Todoist, нашего токена в нём нет. Без него отладка
      // сводится к угадыванию: 410 и 401 выглядят одинаково.
      const detail = (await response.text().catch(() => '')).slice(0, 200).trim();
      throw new Error(`Todoist ответил ${response.status}${detail ? `: ${detail}` : ''}`);
    }

    const task = (await response.json()) as { id?: string; url?: string };
    return {
      ref: task.id,
      url: task.url ?? (task.id ? taskUrl(task.id) : undefined),
    };
  }
}
