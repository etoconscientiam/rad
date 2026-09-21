import { expect, test } from '@playwright/test';
import { settled, sizeInput, slider } from './helpers';

test.describe('3D действительно перерисовывается', () => {
  test('картинка стабильна, пока параметры не меняются', async ({ page }) => {
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const canvas = page.locator('canvas');
    const a = await canvas.screenshot();
    await page.waitForTimeout(700);
    const b = await canvas.screenshot();
    expect(Buffer.compare(a, b), 'без действий кадр не должен меняться').toBe(0);
  });

  test('смена модели меняет картинку, а не только цифры', async ({ page }) => {
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const canvas = page.locator('canvas');
    const before = await canvas.screenshot();
    await page.getByRole('radio', { name: 'Deska' }).click();
    await page.waitForTimeout(900);
    const after = await canvas.screenshot();
    expect(Buffer.compare(before, after), 'кадр обязан измениться').not.toBe(0);
  });

  test('смена размера меняет картинку', async ({ page }) => {
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const canvas = page.locator('canvas');
    const before = await canvas.screenshot();
    const input = sizeInput(page, 'Высота');
    await input.fill('1800');
    await input.blur();
    await page.waitForTimeout(900);
    expect(Buffer.compare(before, await canvas.screenshot())).not.toBe(0);
  });

  test('смена цвета металла меняет картинку', async ({ page }) => {
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const canvas = page.locator('canvas');
    const before = await canvas.screenshot();
    await page.getByRole('radio', { name: 'Белый', exact: true }).click();
    await page.waitForTimeout(900);
    expect(Buffer.compare(before, await canvas.screenshot())).not.toBe(0);
  });
});

test.describe('только клавиатура', () => {
  test('заявку можно отправить, не трогая мышь', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'на телефоне клавиатурной навигации нет');
    let sent: Record<string, unknown> | null = null;
    await page.route('**/api/orders', async (route) => {
      sent = route.request().postDataJSON();
      return route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });

    const phone = page.getByRole('textbox', { name: 'Телефон' });
    await phone.focus();
    await page.keyboard.type('+995 555 12 34 56');

    // Дойти до кнопки табом, не мышью.
    for (let i = 0; i < 8; i++) {
      const isSubmit = await page.evaluate(
        () => document.activeElement?.getAttribute('type') === 'submit',
      );
      if (isSubmit) break;
      await page.keyboard.press('Tab');
    }
    expect(
      await page.evaluate(() => document.activeElement?.getAttribute('type')),
      'до кнопки отправки должно доезжать табом',
    ).toBe('submit');

    await page.keyboard.press('Enter');
    await expect(page.getByText('Заявка принята')).toBeVisible();
    expect(sent).toMatchObject({ customer: { phone: '+995 555 12 34 56' } });
  });

  test('слайдер управляется стрелками при фокусе с клавиатуры', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'на телефоне клавиатурной навигации нет');
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const s = slider(page, 'Ширина');
    await s.focus();
    await expect(s).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(s).toHaveAttribute('aria-valuenow', '460');
  });
});

test.describe('грузинская версия не урезана', () => {
  test('состав конфигуратора совпадает с русским', async ({ page }) => {
    const shape = async (path: string) => {
      await page.goto(`${path}#configurator`);
      await settled(page, { withCanvas: true });
      return page.evaluate(() => ({
        слайдеров: document.querySelectorAll('[role=slider]').length,
        групп: document.querySelectorAll('[role=radiogroup]').length,
        полей: document.querySelectorAll('input').length,
        кнопок: document.querySelectorAll('button').length,
      }));
    };
    const ru = await shape('/ru');
    const ka = await shape('/ka');
    expect(ka).toEqual(ru);
  });

  test('на грузинской странице цена и оговорка на месте', async ({ page }) => {
    await page.goto('/ka#configurator');
    await settled(page, { withCanvas: true });
    await expect(page.getByTestId('grand-total')).toContainText('350');
    await expect(page.getByTestId('price-summary')).toContainText('ფასი სავარაუდოა');
  });
});
