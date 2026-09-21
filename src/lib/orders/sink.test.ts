import { afterEach, describe, expect, it } from 'vitest';
import { resolveSink } from './sink';
import type { Order } from './types';

const original = process.env.TODOIST_TOKEN;

afterEach(() => {
  if (original === undefined) delete process.env.TODOIST_TOKEN;
  else process.env.TODOIST_TOKEN = original;
});

describe('выбор приёмника заявок', () => {
  it('без токена заявка не уходит в никуда, а падает с ошибкой', async () => {
    delete process.env.TODOIST_TOKEN;
    const sink = resolveSink();
    expect(sink.name).toBe('не настроен');
    await expect(sink.submit({} as Order)).rejects.toThrow(/TODOIST_TOKEN/);
  });

  it('с токеном берётся Todoist', () => {
    process.env.TODOIST_TOKEN = 'tdst-abc123';
    expect(resolveSink().name).toBe('todoist');
  });
});
