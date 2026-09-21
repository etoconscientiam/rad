/**
 * Отправка заявки задачей в Todoist. Одна из реализаций OrderSink —
 * в M2 рядом встанет запись в базу, вызывающий код не поменяется.
 *
 * Токен приходит из окружения и никогда не попадает ни в лог, ни в текст
 * ошибки, ни в ответ клиенту.
 */

import { formatOrderTask } from './format';
import type { Order, OrderReceipt, OrderSink } from './types';

const TODOIST_TASKS_URL = 'https://api.todoist.com/rest/v2/tasks';

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
      throw new Error(`Todoist ответил ${response.status}`);
    }

    const task = (await response.json()) as { id?: string; url?: string };
    return { ref: task.id, url: task.url };
  }
}
