import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'RAKURS',
  description: 'Мастерская стальной мебели, Тбилиси',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Предзагружаем только те подмножества, которые точно понадобятся на первом
 * экране этой локали. Остальные начертания браузер возьмёт по unicode-range.
 */
const PRELOAD: Record<string, readonly string[]> = {
  ka: ['NotoSansGeorgian-georgian', 'Onest-latin', 'JetBrainsMono-latin'],
  ru: ['Onest-cyrillic', 'Onest-latin', 'JetBrainsMono-latin'],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <head>
        {(PRELOAD[locale] ?? []).map((file) => (
          <link
            key={file}
            rel="preload"
            as="font"
            type="font/woff2"
            href={`/fonts/${file}.woff2`}
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
