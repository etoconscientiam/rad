import { describe, expect, it } from 'vitest';
import { formatOrderTask } from './format';
import type { Order } from './types';
import { MODELS } from '@/config/catalog';

const order: Order = {
  model: 'deska',
  ...MODELS.deska.defaults,
  qty: 2,
  metalColor: 'black',
  ldspColor: 'light',
  customer: { phone: '+995 555 12 34 56', name: 'Гиорги', comment: 'нужен к пятнице' },
  delivery: { method: 'delivery', address: 'ул. Бахтриони 5' },
  locale: 'ka',
  price: {
    unitPrice: 271,
    total: 542,
    deliveryFee: 30,
    grandTotal: 572,
    profileMeters: 6.92,
    weightKg: 16.06,
    isEstimate: true,
    leadTime: { fromDays: 7, toDays: 10 },
  },
};

describe('текст заявки мастеру', () => {
  const task = formatOrderTask(order);

  it('в заголовке модель, размеры и количество', () => {
    expect(task.title).toContain('Deska');
    expect(task.title).toContain('730×600×1400');
    expect(task.title).toContain('2 шт');
  });

  it('в заголовке телефон — по нему перезванивают', () => {
    expect(task.title).toContain('+995 555 12 34 56');
  });

  it('оговорка про ориентировочную цену обязана попасть в текст', () => {
    expect(task.description).toContain('ориентировочная');
  });

  it('оговорки нет, когда тарифы подтверждены', () => {
    const confirmed = { ...order, price: { ...order.price, isEstimate: false } };
    expect(formatOrderTask(confirmed).description).not.toContain('ориентировочная');
  });

  it('есть всё, что нужно для наряда', () => {
    const d = task.description;
    expect(d).toContain('20×20');
    expect(d).toContain('6.92');
    expect(d).toContain('16.1');
    expect(d).toContain('271');
    expect(d).toContain('542');
  });

  it('видно способ получения и адрес', () => {
    expect(task.description).toContain('ул. Бахтриони 5');
  });

  it('видно язык, на котором клиент оставил заявку', () => {
    expect(task.description).toContain('ka');
  });

  it('комментарий клиента не теряется', () => {
    expect(task.description).toContain('нужен к пятнице');
  });
});
