import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ds';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';

/** 404 внутри локали: в цветах и шрифтах ДС, с путём обратно на сайт. */
export default function NotFound() {
  const t = useTranslations();

  return (
    <>
      <Header />
      <main className="w-full py-16">
        <div className="mx-auto flex max-w-page flex-col items-start gap-4 px-4 md:px-6">
          <span className="microlabel font-mono text-ink-muted">404</span>
          <h1 className="text-h1">{t('notFound.title')}</h1>
          <p className="max-w-[46ch] text-body text-ink-secondary">{t('notFound.text')}</p>
          <Link href="/" className="mt-2 inline-block no-underline">
            <Button variant="secondary">{t('notFound.back')}</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
