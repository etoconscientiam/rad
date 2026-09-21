import { expect, test } from '@playwright/test';
import { collectProblems, settled } from './helpers';

test.describe('несуществующие адреса', () => {
  const paths = ['/ru/нет-такой-страницы', '/ka/missing', '/de', '/ru/configurator'];

  for (const path of paths) {
    test(`${path} отдаёт 404, а не падение`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), 'ожидается 404').toBe(404);
    });

    test(`${path}: страница 404 оформлена, а не голая`, async ({ page }) => {
      const problems = collectProblems(page);
      await page.goto(path);
      await page.waitForLoadState('load');
      // Проверяем, что дизайн-система доехала: фон из токена, а не белый.
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bg, 'фон должен быть из токенов ДС').toBe('rgb(244, 243, 240)');
      await expect(page.locator('html')).toHaveAttribute('lang', /ka|ru/);
      // Браузер пишет в консоль 404 про сам документ — это ожидаемо на этой
      // странице. Всё остальное в консоли быть не должно.
      const unexpected = problems.consoleErrors.filter(
        (e) => !/status of 404/.test(e),
      );
      expect(unexpected).toEqual([]);
    });

    test(`${path}: с 404 можно вернуться на сайт`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('load');
      await expect(page.getByRole('link').first()).toBeVisible();
    });
  }
});

test.describe('витрина компонентов', () => {
  for (const path of ['/ru/ui', '/ka/ui']) {
    test(`${path} открывается без ошибок`, async ({ page }) => {
      const problems = collectProblems(page);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await settled(page);
      expect(problems.consoleErrors).toEqual([]);
      expect(problems.failedRequests).toEqual([]);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }
});

test.describe('соблюдение токенов дизайн-системы', () => {
  /** Палитра «Каркас» — всё, что разрешено красить. */
  const PALETTE = [
    'rgb(244, 243, 240)', // --bg
    'rgb(252, 251, 249)', // --surface
    'rgb(235, 234, 230)', // --surface-sunken
    'rgb(219, 217, 211)', // --border
    'rgb(184, 181, 173)', // --border-strong
    'rgb(28, 27, 25)', // --ink
    'rgb(87, 85, 79)', // --ink-secondary
    'rgb(139, 136, 127)', // --ink-muted
    'rgb(38, 37, 31)', // --graphite
    'rgb(194, 55, 43)', // --accent / --danger
    'rgb(168, 46, 36)', // --accent-hover
    'rgb(246, 228, 225)', // --accent-subtle
    'rgb(255, 255, 255)', // --accent-on
    'rgb(74, 124, 89)', // --success
    'rgb(227, 237, 230)', // --success-subtle
    'rgb(185, 138, 47)', // --warning
    'rgb(23, 23, 26)', // --product-black
    'rgb(142, 144, 148)', // --product-gray
    'rgb(242, 241, 238)', // --product-white
    'rgb(165, 162, 154)', // --dark-text-secondary
    'rgb(212, 72, 58)', // --accent-on-dark
    'rgba(0, 0, 0, 0)', // прозрачный
  ];

  for (const path of ['/ru', '/ru/ui']) {
  test(`${path}: цвета текста и фона берутся только из токенов`, async ({ page }) => {
    await page.goto(path);
    // На витрине компонентов 3D нет — ждать канвас там бессмысленно.
    await settled(page, { withCanvas: path === '/ru' });
    const strays = await page.evaluate((palette) => {
      const found: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.tagName === 'CANVAS' || el.closest('#works')) continue;
        const cs = getComputedStyle(el);
        for (const prop of ['color', 'backgroundColor', 'borderTopColor'] as const) {
          const value = cs[prop];
          if (!value || value.startsWith('rgba(0, 0, 0, 0')) continue;
          if (!palette.includes(value)) {
            found.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 28)} ${prop}=${value}`);
          }
        }
      }
      return [...new Set(found)].slice(0, 12);
    }, PALETTE);
    expect(strays).toEqual([]);
  });
  }

  test('скругления только из шкалы ДС', async ({ page }) => {
    await page.goto('/ru');
    await settled(page, { withCanvas: true });
    const strays = await page.evaluate(() => {
      const allowed = ['0px', '8px', '12px', '999px', '50%', '2px'];
      const found: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = getComputedStyle(el).borderTopLeftRadius;
        if (r && !allowed.includes(r)) {
          found.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 28)} radius=${r}`);
        }
      }
      return [...new Set(found)].slice(0, 12);
    });
    expect(strays).toEqual([]);
  });

  test('мягких теней нет — по спеке единственная тень у sticky-панели', async ({ page }) => {
    await page.goto('/ru');
    await settled(page, { withCanvas: true });
    const blurred = await page.evaluate(() =>
      [...document.querySelectorAll('body *')]
        .map((el) => ({ cls: String(el.className).slice(0, 30), s: getComputedStyle(el).boxShadow }))
        .filter(({ s }) => {
          if (!s || s === 'none') return false;
          // Кольца выбора и inset-обводки имеют нулевой радиус размытия —
          // это не тень. Ищем только те, где размытие больше нуля.
          return s
            .split(/,(?![^()]*\))/)
            .some((part) => {
              const lengths = part.match(/-?\d+(\.\d+)?px/g) ?? [];
              return lengths.length >= 3 && parseFloat(lengths[2]!) > 0;
            });
        })
        .map((x) => `${x.cls}: ${x.s}`),
    );
    expect(blurred).toEqual([]);
  });
});
