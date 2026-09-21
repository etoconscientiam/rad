import { expect, test } from '@playwright/test';
import { settled, slider, total } from './helpers';

/**
 * Настоящее касание через CDP. Синтетические PointerEvent не проходят через
 * компоновщик, а именно он решает, применять ли touch-action — проверять
 * прокрутку ими бессмысленно.
 */
async function realSwipe(
  page: import('@playwright/test').Page,
  selector: string,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const box = (await page.locator(selector).boundingBox())!;
  const at = (p: { x: number; y: number }) => [{ x: box.x + p.x, y: box.y + p.y }];
  const cdp = await page.context().newCDPSession(page);

  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(from) });
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: at({
        x: from.x + ((to.x - from.x) * i) / 8,
        y: from.y + ((to.y - from.y) * i) / 8,
      }),
    });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

test.describe('жесты по модели', () => {
  test('горизонтальный жест пальцем поворачивает модель', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'сценарий телефонный');
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const canvas = page.locator('canvas');
    await canvas.scrollIntoViewIfNeeded();
    const before = await canvas.screenshot();
    const scrollBefore = await page.evaluate(() => window.scrollY);

    await realSwipe(page, 'canvas', { x: 40, y: 120 }, { x: 280, y: 126 });
    await page.waitForTimeout(700);

    expect(Buffer.compare(before, await canvas.screenshot()), 'модель должна повернуться').not.toBe(
      0,
    );
    expect(await page.evaluate(() => window.scrollY), 'страница не должна ехать').toBe(
      scrollBefore,
    );
  });

  test('вертикальный жест по модели листает страницу', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'сценарий телефонный');
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    await page.locator('canvas').scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);

    await realSwipe(page, 'canvas', { x: 160, y: 200 }, { x: 160, y: 30 });
    await page.waitForTimeout(700);

    expect(
      await page.evaluate(() => window.scrollY),
      'вертикальный жест по модели не должен запирать страницу',
    ).toBeGreaterThan(before);
  });
});

test.describe('слайдер мышью', () => {
  test('перетаскивание ручки меняет размер и цену', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'мышиный сценарий');
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const s = slider(page, 'Длина');
    // На узких экранах панель уходит под сгиб — без этого мышь бьёт мимо.
    await s.scrollIntoViewIfNeeded();
    const box = (await s.boundingBox())!;
    const priceBefore = await total(page);

    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();

    const value = Number(await s.getAttribute('aria-valuenow'));
    expect(value).toBeGreaterThan(1200);
    expect(await total(page)).toBeGreaterThan(priceBefore);
  });

  test('после отпускания наведение мышью ничего не меняет', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'мышиный сценарий');
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const s = slider(page, 'Длина');
    await s.scrollIntoViewIfNeeded();
    const box = (await s.boundingBox())!;

    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    const settledValue = await s.getAttribute('aria-valuenow');

    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2, { steps: 5 });
    await page.waitForTimeout(200);
    expect(await s.getAttribute('aria-valuenow')).toBe(settledValue);
  });
});

test.describe('поле количества', () => {
  const cases: Array<[string, string]> = [
    ['ноль', '0'],
    ['отрицательное', '-5'],
    ['буквы', 'абв'],
    ['пусто', ''],
    ['сверх потолка', '9999'],
  ];
  for (const [name, typed] of cases) {
    test(`${name} не ломает расчёт`, async ({ page }) => {
      await page.goto('/ru#configurator');
      await settled(page, { withCanvas: true });
      const qty = page.getByRole('textbox', { name: 'Количество, шт' });
      await qty.fill(typed);
      await qty.blur();
      const value = Number(await qty.inputValue());
      expect(Number.isInteger(value), `в поле осталось «${await qty.inputValue()}»`).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(200);
      expect(await total(page)).toBeGreaterThan(0);
    });
  }
});

test.describe('устойчивость формы', () => {
  test('введённый телефон не теряется при смене модели', async ({ page }) => {
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const phone = page.getByRole('textbox', { name: 'Телефон' });
    await phone.fill('+995 555 12 34 56');
    await page.getByRole('radio', { name: 'Deska' }).click();
    await expect(phone).toHaveValue('+995 555 12 34 56');
  });

  test('двойное нажатие не отправляет две заявки', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/orders', async (route) => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 400));
      return route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    const button = page.getByRole('button', { name: 'Отправить заявку' });
    await button.click();
    await button.click({ force: true, timeout: 2000 }).catch(() => {});
    await expect(page.getByText('Заявка принята')).toBeVisible();
    expect(calls, 'заявка должна уйти один раз').toBe(1);
  });

  test('после неудачи можно попробовать снова', async ({ page }) => {
    let attempt = 0;
    await page.route('**/api/orders', (route) => {
      attempt += 1;
      return attempt === 1
        ? route.fulfill({ status: 502, json: { ok: false, errors: ['sink'] } })
        : route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    const button = page.getByRole('button', { name: 'Отправить заявку' });
    await button.click();
    await expect(page.getByText('Не удалось отправить заявку')).toBeVisible();
    await button.click();
    await expect(page.getByText('Заявка принята')).toBeVisible();
  });

  test('после успеха можно оформить ещё одну заявку', async ({ page }) => {
    await page.route('**/api/orders', (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    await page.getByRole('textbox', { name: 'Телефон' }).fill('+995 555 12 34 56');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Заявка принята')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Отправить заявку|Оформить ещё/ }),
      'должен быть путь обратно к форме',
    ).toBeVisible();
  });
});
