import { defineConfig, devices } from '@playwright/test';

/**
 * E2E гоняем по продакшен-сборке, а не по dev: на показ поедет она.
 * Порт свой, чтобы не конфликтовать с запущенными вручную серверами.
 */
const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 900 } } },
    {
      // 360 — нижняя граница из задания, а не пресет устройства.
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 360, height: 780 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
  webServer: {
    command: `NEXT_DIST_DIR=.next-build PORT=${PORT} next start`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
