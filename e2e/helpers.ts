import type { Page } from '@playwright/test';

/** Эталонные значения из docs/02-domain-model.md, сняты с прототипа. */
export const REFERENCE = {
  cube: { size: '1200×450×750', profile: '30×30', price: 350, meters: '9.60', weight: '13.4' },
  deska: { size: '1400×600×730', profile: '20×20', price: 271, meters: '6.92' },
  deliveryFee: 30,
} as const;

/** Числовое поле рядом со слайдером по его подписи. */
export function sizeInput(page: Page, label: string) {
  return page.getByRole('slider', { name: label }).locator('..').getByRole('textbox', { name: label });
}

export function slider(page: Page, label: string) {
  return page.getByRole('slider', { name: label });
}

/** Сумма из панели расчёта. */
export async function total(page: Page): Promise<number> {
  const text = await page.getByTestId('grand-total').innerText();
  return Number(text.replace(/[^\d]/g, ''));
}

/**
 * Дождаться состояния, в котором осмысленно мерить раскладку: шрифты
 * применены, картинки разложены. networkidle этого не гарантирует —
 * под нагрузкой замер попадал в момент до применения шрифта.
 */
export async function settled(page: Page, { withCanvas = false } = {}) {
  await page.waitForLoadState('load');
  if (withCanvas) await page.locator('canvas').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
}

/** Собрать консольные ошибки и неудачные запросы за время сценария. */
export function collectProblems(page: Page) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const externalRequests: string[] = [];

  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
    if (!r.url().startsWith('http://localhost')) externalRequests.push(r.url());
  });

  return { consoleErrors, failedRequests, externalRequests };
}
