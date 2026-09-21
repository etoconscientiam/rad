import { expect, test } from '@playwright/test';
import { REFERENCE, total } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/ru#configurator');
  await expect(page.locator('canvas')).toBeVisible();
});

test.describe('форма заявки', () => {
  test('без телефона заявка не уходит и поле подсвечено', async ({ page }) => {
    let sent = false;
    await page.route('**/api/orders', (route) => {
      sent = true;
      return route.continue();
    });
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Укажите номер телефона')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Телефон' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(sent, 'запрос не должен уходить при пустом телефоне').toBe(false);
  });

  test('доставка добавляет адрес и меняет итог', async ({ page }) => {
    const before = await total(page);
    await page.getByRole('radio', { name: 'Доставка по Тбилиси' }).click();
    await expect(page.getByRole('textbox', { name: 'Адрес доставки' })).toBeVisible();
    await expect(page.getByTestId('delivery-fee')).toContainText(String(REFERENCE.deliveryFee));
    expect(await total(page)).toBe(before + REFERENCE.deliveryFee);
  });

  test('доставка без адреса не проходит', async ({ page }) => {
    await page.getByRole('radio', { name: 'Доставка по Тбилиси' }).click();
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Укажите адрес доставки')).toBeVisible();
  });

  test('возврат на самовывоз снимает требование адреса', async ({ page }) => {
    await page.getByRole('radio', { name: 'Доставка по Тбилиси' }).click();
    await page.getByRole('radio', { name: 'Самовывоз' }).click();
    await expect(page.getByRole('textbox', { name: 'Адрес доставки' })).toHaveCount(0);
  });

  test('успех показывается только при успехе', async ({ page }) => {
    await page.route('**/api/orders', (route) =>
      route.fulfill({ status: 200, json: { ok: true, ref: 'T-1' } }),
    );
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Заявка принята')).toBeVisible();
  });

  test('отказ приёмника не выдаётся за успех', async ({ page }) => {
    await page.route('**/api/orders', (route) =>
      route.fulfill({ status: 502, json: { ok: false, errors: ['sink'] } }),
    );
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Не удалось отправить заявку')).toBeVisible();
    await expect(page.getByText('Заявка принята')).toHaveCount(0);
  });

  test('сеть отвалилась — тоже честный отказ', async ({ page }) => {
    await page.route('**/api/orders', (route) => route.abort('failed'));
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Не удалось отправить заявку')).toBeVisible();
  });

  test('400 по полю, которого нет в форме, не оставляет кнопку немой', async ({ page }) => {
    await page.route('**/api/orders', (route) =>
      route.fulfill({ status: 400, json: { ok: false, errors: ['model'] } }),
    );
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Не удалось отправить заявку')).toBeVisible();
  });

  test('в заявку уходит показанная человеку сумма', async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route('**/api/orders', async (route) => {
      body = route.request().postDataJSON();
      return route.fulfill({ status: 200, json: { ok: true } });
    });
    const shown = await total(page);
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Заявка принята')).toBeVisible();
    expect(body).toMatchObject({ quotedTotal: shown });
  });

  test('расхождение цены показывается человеку, а не проглатывается', async ({ page }) => {
    await page.route('**/api/orders', (route) =>
      route.fulfill({ status: 409, json: { ok: false, errors: ['price'], total: 999 } }),
    );
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Цена на экране разошлась')).toBeVisible();
    await expect(page.getByText('Заявка принята')).toHaveCount(0);
  });

  test('в заявку уходит то, что собрано в конфигураторе', async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route('**/api/orders', async (route) => {
      body = route.request().postDataJSON();
      return route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.getByRole('radio', { name: 'Deska' }).click();
    await page.getByRole('radio', { name: '30×30' }).click();
    await page.getByRole('radio', { name: 'Серый', exact: true }).click();
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Заявка принята')).toBeVisible();

    expect(body).toMatchObject({
      model: 'deska',
      profile: 30,
      metalColor: 'gray',
      ldspColor: 'light',
      qty: 1,
      locale: 'ru',
      delivery: { method: 'pickup' },
    });
    expect(body).not.toHaveProperty('price');
  });
});

test.describe('приём заявки на сервере', () => {
  const draft = {
    model: 'cube',
    h: 750,
    w: 450,
    l: 1200,
    profile: 30,
    qty: 1,
    metalColor: 'black',
    customer: { phone: '+995 555 00 00 00' },
    delivery: { method: 'pickup' },
    locale: 'ru',
  };

  const cases: Array<[string, unknown, string]> = [
    ['свойство прототипа вместо сечения', { ...draft, profile: 'constructor' }, 'profile'],
    ['количество сверх потолка', { ...draft, qty: 9999 }, 'qty'],
    ['цвет вне каталога', { ...draft, metalColor: 'зелёный' }, 'metalColor'],
    ['чужая локаль', { ...draft, locale: 'hy' }, 'locale'],
    ['неизвестный способ получения', { ...draft, delivery: { method: 'телепорт' } }, 'method'],
    ['размер вне диапазона', { ...draft, h: 9999 }, 'h'],
    ['ЛДСП у модели без столешницы', { ...draft, ldspColor: 'light' }, 'ldspColor'],
  ];

  for (const [name, payload, field] of cases) {
    test(`отвергает: ${name}`, async ({ request }) => {
      const res = await request.post('/api/orders', { data: payload });
      expect(res.status()).toBe(400);
      expect((await res.json()).errors).toContain(field);
    });
  }

  for (const [name, raw] of [
    ['null', 'null'],
    ['массив', '[]'],
    ['строка', '"привет"'],
    ['битый JSON', '{'],
  ] as const) {
    test(`тело «${name}» — это 400, а не падение`, async ({ request }) => {
      const res = await request.post('/api/orders', {
        headers: { 'content-type': 'application/json' },
        data: raw,
      });
      expect(res.status()).toBe(400);
    });
  }

  test('подделанная сумма отвергается настоящим сервером', async ({ request }) => {
    const res = await request.post('/api/orders', { data: { ...draft, quotedTotal: 1 } });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.errors).toContain('price');
    expect(body.total, 'сервер сообщает свою сумму').toBe(350);
  });

  test('GET не принимается', async ({ request }) => {
    expect((await request.get('/api/orders')).status()).toBe(405);
  });

  test('корректная заявка доходит до приёмника', async ({ request }) => {
    const res = await request.post('/api/orders', { data: draft });
    // Токена Todoist нет, поэтому 502 от приёмника — это успех валидации.
    expect([200, 502]).toContain(res.status());
    if (res.status() === 502) expect((await res.json()).errors).toEqual(['sink']);
  });

  test('в ответе нет ни токена, ни внутренностей', async ({ request }) => {
    const res = await request.post('/api/orders', { data: draft });
    const text = await res.text();
    expect(text).not.toMatch(/TODOIST|Bearer|api\.todoist/i);
  });
});
