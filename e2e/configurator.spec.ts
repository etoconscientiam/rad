import { expect, test } from '@playwright/test';
import { REFERENCE, collectProblems, sizeInput, slider, total } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/ru#configurator');
  await expect(page.locator('canvas')).toBeVisible();
});

test.describe('3D-вьюпорт', () => {
  test('канвас живой, контекст WebGL получен', async ({ page }) => {
    const ok = await page.locator('canvas').evaluate((c: HTMLCanvasElement) => {
      const gl = c.getContext('webgl2') ?? c.getContext('webgl');
      return !!gl && c.width > 0 && c.height > 0;
    });
    expect(ok).toBe(true);
  });

  test('плашка габаритов повторяет выбранные размеры', async ({ page }) => {
    await expect(page.getByText(`${REFERENCE.cube.size} мм`)).toBeVisible();
    await sizeInput(page, 'Высота').fill('900');
    await sizeInput(page, 'Высота').blur();
    await expect(page.getByText('1200×450×900 мм')).toBeVisible();
  });

  test('рендер не сыплет ошибками в консоль', async ({ page }) => {
    const problems = collectProblems(page);
    await page.goto('/ru#configurator');
    await page.waitForTimeout(2500);
    await sizeInput(page, 'Длина').fill('2000');
    await sizeInput(page, 'Длина').blur();
    await page.waitForTimeout(1000);
    expect(problems.consoleErrors).toEqual([]);
  });
});

test.describe('выбор модели', () => {
  test('в спринте доступны ровно Cube и Deska', async ({ page }) => {
    const group = page.getByRole('radiogroup', { name: 'Модель' });
    await expect(group.getByRole('radio')).toHaveCount(2);
    await expect(group.getByRole('radio', { name: 'Cube' })).toBeVisible();
    await expect(group.getByRole('radio', { name: 'Deska' })).toBeVisible();
  });

  test('смена модели подтягивает её диапазоны и умолчания', async ({ page }) => {
    await expect(slider(page, 'Высота')).toHaveAttribute('aria-valuemin', '200');
    await expect(slider(page, 'Высота')).toHaveAttribute('aria-valuenow', '750');

    await page.getByRole('radio', { name: 'Deska' }).click();
    await expect(slider(page, 'Высота')).toHaveAttribute('aria-valuemin', '400');
    await expect(slider(page, 'Высота')).toHaveAttribute('aria-valuemax', '1100');
    await expect(slider(page, 'Высота')).toHaveAttribute('aria-valuenow', '730');
    await expect(slider(page, 'Длина')).toHaveAttribute('aria-valuenow', '1400');
  });

  test('ЛДСП показывается только у модели со столешницей', async ({ page }) => {
    await expect(page.getByRole('radiogroup', { name: 'Столешница, ЛДСП' })).toHaveCount(0);
    await page.getByRole('radio', { name: 'Deska' }).click();
    await expect(page.getByRole('radiogroup', { name: 'Столешница, ЛДСП' })).toBeVisible();
  });
});

test.describe('слайдер размера', () => {
  test('стрелки двигают на шаг, Home и End — на края', async ({ page }) => {
    const s = slider(page, 'Высота');
    await s.focus();
    await page.keyboard.press('ArrowRight');
    await expect(s).toHaveAttribute('aria-valuenow', '760');
    await page.keyboard.press('ArrowLeft');
    await expect(s).toHaveAttribute('aria-valuenow', '750');
    await page.keyboard.press('End');
    await expect(s).toHaveAttribute('aria-valuenow', '2000');
    await page.keyboard.press('Home');
    await expect(s).toHaveAttribute('aria-valuenow', '200');
  });

  test('слайдер озвучивает значение с единицей', async ({ page }) => {
    await expect(slider(page, 'Высота')).toHaveAttribute('aria-valuetext', '750 мм');
  });

  test.describe('числовой ввод', () => {
    const cases: Array<[string, string, string]> = [
      ['выше максимума', '9999', '2000'],
      ['ниже минимума', '5', '200'],
      ['не кратно шагу', '1234', '1230'],
    ];
    for (const [name, typed, expected] of cases) {
      test(name, async ({ page }) => {
        const input = sizeInput(page, 'Высота');
        await input.fill(typed);
        await input.blur();
        await expect(slider(page, 'Высота')).toHaveAttribute('aria-valuenow', expected);
      });
    }

    test('мусор и пустое поле откатываются к текущему значению', async ({ page }) => {
      const input = sizeInput(page, 'Высота');
      for (const bogus of ['', 'abc']) {
        await input.fill(bogus);
        await input.blur();
        await expect(slider(page, 'Высота')).toHaveAttribute('aria-valuenow', '750');
        await expect(input).toHaveValue('750');
      }
    });
  });
});

test.describe('расчёт', () => {
  test('cube по умолчанию совпадает с прототипом', async ({ page }) => {
    expect(await total(page)).toBe(REFERENCE.cube.price);
    await expect(page.getByTestId('profile-meters')).toContainText(REFERENCE.cube.meters);
    await expect(page.getByTestId('weight')).toContainText(REFERENCE.cube.weight);
    await expect(page.getByTestId('lead-time')).toContainText('7–10');
  });

  test('deska по умолчанию совпадает с прототипом', async ({ page }) => {
    await page.getByRole('radio', { name: 'Deska' }).click();
    expect(await total(page)).toBe(REFERENCE.deska.price);
    await expect(page.getByTestId('profile-meters')).toContainText(REFERENCE.deska.meters);
  });

  test('смена сечения меняет цену', async ({ page }) => {
    expect(await total(page)).toBe(350);
    await page.getByRole('radio', { name: '20×20' }).click();
    expect(await total(page)).toBe(273);
    await page.getByRole('radio', { name: '40×40' }).click();
    expect(await total(page)).toBeGreaterThan(350);
  });

  test('количество умножает сумму и меняет срок', async ({ page }) => {
    const one = await total(page);
    const qty = page.getByRole('textbox', { name: 'Количество, шт' });
    await qty.fill('6');
    await qty.blur();
    expect(await total(page)).toBe(one * 6);
    await expect(page.getByTestId('lead-time')).toContainText('9–13');
  });

  test('оговорка про ориентировочную цену стоит рядом с суммой', async ({ page }) => {
    const summary = page.getByTestId('price-summary');
    await expect(summary).toContainText('Цена ориентировочная');
  });

  test('тонкий профиль на крупном габарите предупреждает', async ({ page }) => {
    await expect(page.getByTestId('thin-profile')).toHaveCount(0);
    await page.getByRole('radio', { name: '20×20' }).click();
    const input = sizeInput(page, 'Высота');
    await input.fill('1600');
    await input.blur();
    await expect(page.getByTestId('thin-profile')).toBeVisible();
    await page.getByRole('radio', { name: '30×30' }).click();
    await expect(page.getByTestId('thin-profile')).toHaveCount(0);
  });
});
