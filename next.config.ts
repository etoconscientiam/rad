import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Продакшен-сборка пишет в свой каталог: иначе `next build` затирает .next
  // под работающим `next dev` и дев-сервер отдаёт 500 до перезапуска.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
};

export default withNextIntl(nextConfig);
