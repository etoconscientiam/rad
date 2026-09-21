import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="mx-auto max-w-page px-4 py-16 md:px-6">
      <header className="mb-12 flex items-center justify-between gap-4">
        <span className="microlabel text-ink-secondary">{t('brand.tagline')}</span>
        <LocaleSwitcher />
      </header>

      <h1 className="text-display">{t('brand.name')}</h1>
      <p className="mt-4 max-w-[60ch] text-body text-ink-secondary">{t('price.estimate')}</p>

      <p className="mt-8">
        <Link href="/ui" className="text-body">
          {t('nav.ds')}
        </Link>
      </p>
    </main>
  );
}
