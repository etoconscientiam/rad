import { expect, test } from '@playwright/test';
import { settled } from './helpers';

const PAGES = ['/ka', '/ru'];

test.describe('адаптив и доступность', () => {
  for (const path of PAGES) {
    test(`${path}: нет горизонтального переполнения`, async ({ page }) => {
      await page.goto(path);
      await settled(page, { withCanvas: true });
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        return { scroll: de.scrollWidth, client: de.clientWidth };
      });
      expect(overflow.scroll, `${overflow.scroll} > ${overflow.client}`).toBeLessThanOrEqual(
        overflow.client + 1,
      );
    });

    test(`${path}: ничего не выходит за правый край`, async ({ page }) => {
      await page.goto(path);
      await settled(page, { withCanvas: true });
      const spilling = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        return [...document.querySelectorAll('body *')]
          .filter((e) => e.getBoundingClientRect().right > limit + 1)
          .slice(0, 5)
          .map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 40)}`);
      });
      expect(spilling).toEqual([]);
    });

    test(`${path}: тач-зоны не меньше 44px`, async ({ page }) => {
      await page.goto(path);
      await settled(page, { withCanvas: true });
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('button, a, [role=slider], [role=radio]')]
          .map((e) => ({
            t: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24),
            h: Math.round(e.getBoundingClientRect().height),
          }))
          .filter((x) => x.h > 0 && x.h < 44),
      );
      expect(small).toEqual([]);
    });
  }

  test('у каждого поля формы есть подпись', async ({ page }) => {
    await page.goto('/ru#configurator');
    const unlabelled = await page.evaluate(() =>
      [...document.querySelectorAll('input')]
        .filter((i) => {
          const id = i.getAttribute('id');
          const hasLabel = id ? !!document.querySelector(`label[for="${id}"]`) : false;
          return !hasLabel && !i.getAttribute('aria-label');
        })
        .map((i) => i.outerHTML.slice(0, 80)),
    );
    expect(unlabelled).toEqual([]);
  });

  test('фокус виден с клавиатуры', async ({ page }) => {
    await page.goto('/ru');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return { width: cs.outlineWidth, style: cs.outlineStyle, color: cs.outlineColor };
    });
    expect(outline, 'после Tab должен быть сфокусированный элемент').not.toBeNull();
    expect(outline!.style).not.toBe('none');
    expect(parseFloat(outline!.width)).toBeGreaterThan(0);
  });

  test('группы выбора размечены как radiogroup', async ({ page }) => {
    await page.goto('/ru#configurator');
    const groups = page.getByRole('radiogroup');
    expect(await groups.count()).toBeGreaterThanOrEqual(4);
    for (const g of await groups.all()) {
      expect((await g.getAttribute('aria-label'))?.trim(), 'у группы должна быть подпись').toBeTruthy();
    }
  });

  test('выбранное значение помечено aria-checked', async ({ page }) => {
    await page.goto('/ru#configurator');
    const group = page.getByRole('radiogroup', { name: 'Сечение профиля, мм' });
    await expect(group.getByRole('radio', { checked: true })).toHaveCount(1);
    await group.getByRole('radio', { name: '40×40' }).click();
    await expect(group.getByRole('radio', { name: '40×40' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});

test.describe('жесты и прокрутка', () => {
  test('колесо над 3D не крадёт прокрутку страницы', async ({ page }) => {
    await page.goto('/ru#configurator');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const before = await page.evaluate(() => window.scrollY);
    await canvas.hover();
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.scrollY);
    expect(after, 'страница должна прокрутиться').toBeGreaterThan(before);
  });
});
