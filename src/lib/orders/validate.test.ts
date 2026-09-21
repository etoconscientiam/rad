import { describe, expect, it } from 'vitest';
import { validateDraft } from './validate';
import { MODELS } from '@/config/catalog';
import { MAX_QTY } from '@/config/pricing';

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

describe('поля, которым нельзя верить с клиента', () => {
  it('количество сверх потолка не принимаем — форма ограничивает, но запрос может прийти мимо неё', () => {
    expect(validateDraft({ ...valid, qty: MAX_QTY + 1 }).errors).toContain('qty');
    expect(validateDraft({ ...valid, qty: MAX_QTY }).errors).toEqual([]);
  });

  it('дробное количество не принимаем', () => {
    expect(validateDraft({ ...valid, qty: 1.5 }).errors).toContain('qty');
  });

  it('неизвестный цвет металла не принимаем', () => {
    expect(validateDraft({ ...valid, metalColor: 'зелёный' }).errors).toContain('metalColor');
  });

  it('неизвестный цвет ЛДСП не принимаем', () => {
    const table = { ...valid, model: 'deska' as const, ...MODELS.deska.defaults };
    expect(validateDraft({ ...table, ldspColor: 'палисандр' }).errors).toContain('ldspColor');
    expect(validateDraft({ ...table, ldspColor: 'light' }).errors).toEqual([]);
  });

  it('неизвестный способ получения не принимаем', () => {
    expect(
      validateDraft({ ...valid, delivery: { method: 'телепорт' as never } }).errors,
    ).toContain('method');
  });

  it('неизвестную локаль не принимаем', () => {
    expect(validateDraft({ ...valid, locale: 'hy' as never }).errors).toContain('locale');
  });

  it('простыню текста в комментарии не принимаем — она уедет мастеру в задачу', () => {
    const comment = 'а'.repeat(5000);
    expect(validateDraft({ ...valid, customer: { ...valid.customer, comment } }).errors).toContain(
      'comment',
    );
  });

  it('длинное имя и адрес не принимаем', () => {
    expect(
      validateDraft({ ...valid, customer: { ...valid.customer, name: 'я'.repeat(500) } }).errors,
    ).toContain('name');
    expect(
      validateDraft({
        ...valid,
        delivery: { method: 'delivery', address: 'у'.repeat(2000) },
      }).errors,
    ).toContain('address');
  });
});
