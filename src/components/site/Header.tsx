import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

/** Шапка. Тени нет намеренно: единственная тень системы — у sticky-панели снизу. */
export function Header() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-1 md:px-6">
        <Link href="/" className="inline-flex min-h-[var(--touch-min)] items-center text-h3 font-extrabold no-underline">
          {t('brand.name')}
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <a href="#configurator" className="inline-flex min-h-[var(--touch-min)] items-center text-small text-ink-secondary no-underline">
            {t('nav.configurator')}
          </a>
          <a href="#works" className="hidden min-h-[var(--touch-min)] items-center text-small text-ink-secondary no-underline sm:inline-flex">
            {t('nav.works')}
          </a>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
