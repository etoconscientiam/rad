import { expect, test } from '@playwright/test';
import { settled, sizeInput, slider } from './helpers';

/**
 * Живой ли рендерер: меняем параметр и смотрим, изменилась ли картинка.
 * readPixels здесь не годится — без preserveDrawingBuffer буфер очищается
 * после композиции и всегда читается пустым.
 */
async function viewportStillResponds(page: import('@playwright/test').Page) {
  const canvas = page.locator('canvas');
  const before = await canvas.screenshot();
  await page.getByRole('radio', { name: '40×40' }).click();
  await page.waitForTimeout(900);
  const after = await canvas.screenshot();
  return Buffer.compare(before, after) !== 0;
}

test.describe('долгая работа', () => {
  test('десять переключений языка не гасят вьюпорт', async ({ page }) => {
    test.setTimeout(120_000);
    const evictions: string[] = [];
    page.on('console', (m) => {
      // Именно вытеснение браузером. «Context Lost» three пишет сам,
      // когда штатно освобождает контекст при выгрузке — это не утечка.
      if (/too many active webgl/i.test(m.text())) evictions.push(m.text());
    });

    await page.goto('/ru');
    await settled(page, { withCanvas: true });

    for (let i = 0; i < 10; i++) {
      const to = i % 2 === 0 ? 'ka' : 'ru';
      await page.getByRole('navigation', { name: 'Language' }).getByRole('link', { name: to }).click();
      await page.locator('canvas').waitFor({ state: 'visible' });
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(600);

    expect(evictions, 'браузер не должен вытеснять контексты').toEqual([]);
    expect(
      await viewportStillResponds(page),
      'после десяти переключений модель должна перерисовываться',
    ).toBe(true);
  });

  test('сорок изменений размера подряд не гасят вьюпорт', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'мышиный сценарий');
    test.setTimeout(120_000);
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });

    const s = slider(page, 'Длина');
    await s.scrollIntoViewIfNeeded();
    const box = (await s.boundingBox())!;

    await page.mouse.move(box.x + box.width * 0.1, box.y + box.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 40; i++) {
      await page.mouse.move(box.x + box.width * (0.1 + (0.8 * i) / 40), box.y + box.height / 2);
    }
    await page.mouse.up();
    await page.waitForTimeout(900);

    expect(Number(await s.getAttribute('aria-valuenow'))).toBeGreaterThan(1200);
    expect(
      await viewportStillResponds(page),
      'после сорока изменений модель должна перерисовываться',
    ).toBe(true);
  });

  test('двадцать правок размера не ломают цену', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/ru#configurator');
    await settled(page, { withCanvas: true });
    const input = sizeInput(page, 'Высота');
    for (let i = 0; i < 20; i++) {
      await input.fill(String(200 + i * 90));
      await input.blur();
    }
    const total = Number((await page.getByTestId('grand-total').innerText()).replace(/\D/g, ''));
    expect(Number.isFinite(total) && total > 0, `в итоге «${total}»`).toBe(true);
  });
});

test.describe('слабая сеть', () => {
  test('на медленном канале страница читается до загрузки 3D', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'нужен CDP');
    test.setTimeout(120_000);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 300,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
    });

    await page.goto('/ru', { waitUntil: 'domcontentloaded' });
    // Текст и кнопка заявки обязаны быть доступны, пока грузится 3D.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Как это работает' })).toBeVisible({
      timeout: 30_000,
    });
    await cdp.detach();
  });

  test('если 3D не загрузился, страница остаётся рабочей', async ({ page }) => {
    test.setTimeout(120_000);

    // Сначала узнаём, в каком чанке приезжает three — имя у него хэшированное.
    const sizes = new Map<string, number>();
    page.on('response', async (r) => {
      if (!r.url().includes('/chunks/') || !r.url().endsWith('.js')) return;
      const length = Number(r.headers()['content-length'] ?? 0);
      if (length) sizes.set(r.url(), length);
    });
    await page.goto('/ru');
    await settled(page, { withCanvas: true });

    const heaviest = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0];
    expect(heaviest, 'чанк с 3D должен быть найден').toBeTruthy();

    // Теперь рвём именно его и проверяем, что страница остаётся рабочей.
    await page.route(heaviest![0], (route) => route.abort('failed'));
    await page.goto('/ru');
    await page.waitForLoadState('load');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('grand-total')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Отправить заявку' })).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Модель' })).toBeVisible();
  });
});
