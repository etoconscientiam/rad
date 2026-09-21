import { expect, test } from '@playwright/test';
import { collectProblems, settled } from './helpers';

test.describe('витрина', () => {
  test('корень уводит на грузинский — язык по умолчанию', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/ka$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ka');
  });

  test('на странице ровно один h1 и он из словаря', async ({ page }) => {
    await page.goto('/ru');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('Простой способ заказать стальной каркас');
  });

  test('все секции витрины на месте', async ({ page }) => {
    await page.goto('/ru');
    await expect(page.getByRole('heading', { name: 'Конструктор', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Как это работает' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Наши работы' })).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('три шага пронумерованы и подписаны', async ({ page }) => {
    await page.goto('/ru');
    const steps: Array<[string, string]> = [
      ['01', 'Настройка'],
      ['02', 'Заявка'],
      ['03', 'Получение заказа'],
    ];
    for (const [n, title] of steps) {
      await expect(page.getByText(n, { exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    }
  });

  test('у каждого фото работы есть alt', async ({ page }) => {
    await page.goto('/ru');
    const images = page.locator('#works img');
    await expect(images).toHaveCount(4);
    for (const img of await images.all()) {
      expect((await img.getAttribute('alt'))?.trim()).toBeTruthy();
    }
  });

  test('телефон и почта в футере кликабельны', async ({ page }) => {
    await page.goto('/ru');
    const footer = page.getByRole('contentinfo');
    await expect(footer.locator('a[href^="tel:"]')).toHaveCount(1);
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
  });

  test('кнопка hero ведёт к конструктору', async ({ page }) => {
    await page.goto('/ru');
    await page.getByRole('link', { name: 'Собрать свой каркас' }).click();
    await expect(page).toHaveURL(/#configurator$/);
    await expect(page.locator('#configurator')).toBeInViewport();
  });
});

test.describe('языки', () => {
  test('переключение меняет язык и остаётся на той же странице', async ({ page }) => {
    await page.goto('/ru');
    await page.getByRole('navigation', { name: 'Language' }).getByRole('link', { name: 'ka' }).click();
    await expect(page).toHaveURL(/\/ka$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ka');
    await expect(page.locator('h1')).toHaveText('ლითონის კარკასის შეკვეთის მარტივი გზა');
  });

  test('русских слов на грузинской странице нет', async ({ page }) => {
    await page.goto('/ka');
    const text = await page.locator('main, header, footer').allInnerTexts();
    const cyrillic = text.join(' ').match(/[а-яА-ЯёЁ]{3,}/g);
    expect(cyrillic ?? []).toEqual([]);
  });
});

test.describe('гигиена страницы', () => {
  test('ни одного внешнего запроса, ошибки консоли и 404', async ({ page }) => {
    const problems = collectProblems(page);
    await page.goto('/ka');
    await settled(page, { withCanvas: true });
    expect(problems.externalRequests, 'внешние запросы').toEqual([]);
    expect(problems.failedRequests, 'неудачные запросы').toEqual([]);
    expect(problems.consoleErrors, 'ошибки консоли').toEqual([]);
  });
});
