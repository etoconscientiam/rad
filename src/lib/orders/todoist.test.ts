import { describe, expect, it } from 'vitest';
import { TodoistSink } from './todoist';
import type { Order } from './types';
import { MODELS } from '@/config/catalog';

const order: Order = {
  model: 'cube',
  ...MODELS.cube.defaults,
  qty: 1,
  metalColor: 'black',
  customer: { phone: '+995 555 12 34 56' },
  delivery: { method: 'pickup' },
  locale: 'ru',
  price: {
    unitPrice: 350,
    total: 350,
    deliveryFee: 0,
    grandTotal: 350,
    profileMeters: 9.6,
    weightKg: 13.44,
    isEstimate: true,
    leadTime: { fromDays: 7, toDays: 10 },
  },
};

function recordingFetch(response: Response) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return response;
  };
  return { impl, calls };
}

const ok = () =>
  new Response(JSON.stringify({ id: '123', url: 'https://todoist.com/showTask?id=123' }), {
    status: 200,
  });

describe('приёмник Todoist', () => {
  it('шлёт задачу в REST v2 с авторизацией', async () => {
    const { impl, calls } = recordingFetch(ok());
    const sink = new TodoistSink({ token: 'tdst-abc123', projectId: 'P1' }, impl);
    const receipt = await sink.submit(order);

    const call = calls[0]!;
    expect(call.url).toBe('https://api.todoist.com/rest/v2/tasks');
    expect(call.init.method).toBe('POST');
    expect(new Headers(call.init.headers).get('authorization')).toBe('Bearer tdst-abc123');
    expect(receipt).toEqual({ ref: '123', url: 'https://todoist.com/showTask?id=123' });
  });

  it('в теле задачи размеры, цена и оговорка', async () => {
    const { impl, calls } = recordingFetch(ok());
    await new TodoistSink({ token: 'x', projectId: 'P1' }, impl).submit(order);
    const body = JSON.parse(String(calls[0]!.init.body));
    expect(body.project_id).toBe('P1');
    expect(body.content).toContain('750×450×1200');
    expect(body.description).toContain('350');
    expect(body.description).toContain('ориентировочная');
  });

  it('секция добавляется только если задана', async () => {
    const a = recordingFetch(ok());
    await new TodoistSink({ token: 'x', projectId: 'P1' }, a.impl).submit(order);
    expect(JSON.parse(String(a.calls[0]!.init.body))).not.toHaveProperty('section_id');

    const b = recordingFetch(ok());
    await new TodoistSink({ token: 'x', projectId: 'P1', sectionId: 'S1' }, b.impl).submit(order);
    expect(JSON.parse(String(b.calls[0]!.init.body)).section_id).toBe('S1');
  });

  it('отказ Todoist поднимается ошибкой, а не тихо проглатывается', async () => {
    const { impl } = recordingFetch(new Response('нет доступа', { status: 403 }));
    const sink = new TodoistSink({ token: 'tdst-abc123', projectId: 'P1' }, impl);
    await expect(sink.submit(order)).rejects.toThrow(/403/);
  });

  it('текст ошибки не содержит токен', async () => {
    const { impl } = recordingFetch(new Response('нет доступа', { status: 403 }));
    const sink = new TodoistSink({ token: 'tdst-very-secret', projectId: 'P1' }, impl);
    await expect(sink.submit(order)).rejects.toThrow(
      expect.objectContaining({ message: expect.not.stringContaining('tdst-very-secret') }),
    );
  });
});
