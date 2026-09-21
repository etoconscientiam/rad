'use client';

import { useLocale } from 'next-intl';
import { LOCALES } from '@/config/locales';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/** Переключатель языка. Список берётся из конфига, не из разметки. */
export function LocaleSwitcher() {
  const active = useLocale();
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2" aria-label="Language">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          className={cn(
            'microlabel rounded-control px-2 py-1 no-underline',
            locale === active ? 'bg-ink text-accent-on' : 'text-ink-secondary',
          )}
        >
          {locale}
        </Link>
      ))}
    </nav>
  );
}
