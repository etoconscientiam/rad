import { describe, expect, it } from 'vitest';
import { validateDraft } from './validate';
import { MODELS } from '@/config/catalog';

const valid = {
  model: 'cube' as const,
  ...MODELS.cube.defaults,
  qty: 1,
  metalColor: 'black',
  customer: { phone: '+995 555 12 34 56' },
  delivery: { method: 'pickup' as const },
  locale: 'ru' as const,
};

describe('проверка заявки', () => {
  it('корректная заявка проходит', () => {
    expect(validateDraft(valid).errors).toEqual([]);
  });

  it('без телефона не принимаем', () => {
    const { errors } = validateDraft({ ...valid, customer: { phone: '  ' } });
    expect(errors).toContain('phone');
  });

  it('телефон короче семи цифр не принимаем', () => {
    expect(validateDraft({ ...valid, customer: { phone: '+995 55' } }).errors).toContain('phone');
  });

  it('размер вне диапазона модели не принимаем', () => {
    const { errors } = validateDraft({ ...valid, h: MODELS.cube.ranges.h.max + 10 });
    expect(errors).toContain('h');
  });

  it('модель вне спринта не принимаем', () => {
    expect(validateDraft({ ...valid, model: 'stella' }).errors).toContain('model');
  });

  it('несуществующее сечение профиля не принимаем', () => {
    expect(validateDraft({ ...valid, profile: 25 as never }).errors).toContain('profile');
  });

  it('количество меньше единицы не принимаем', () => {
    expect(validateDraft({ ...valid, qty: 0 }).errors).toContain('qty');
  });

  it('доставка без адреса не принимается', () => {
    const { errors } = validateDraft({ ...valid, delivery: { method: 'delivery' } });
    expect(errors).toContain('address');
  });

  it('самовывоз без адреса — нормально', () => {
    expect(validateDraft(valid).errors).toEqual([]);
  });
});
