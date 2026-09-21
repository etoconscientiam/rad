import { useTranslations } from 'next-intl';
import { WORKSHOP, phoneHref } from '@/config/workshop';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="mt-auto bg-graphite text-dark-text">
      <div className="mx-auto flex max-w-page flex-wrap justify-between gap-8 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-2">
          <span className="text-h3 font-extrabold">{t('brand.name')}</span>
          <span className="text-small text-dark-text-secondary">{t('brand.tagline')}</span>
          <span className="text-small text-dark-text-secondary">{t('footer.questions')}</span>
        </div>
        <div className="flex flex-col font-mono text-small">
          <a href={phoneHref} className="inline-flex min-h-[var(--touch-min)] items-center text-dark-text no-underline">
            {WORKSHOP.phone}
          </a>
          <a href={`mailto:${WORKSHOP.email}`} className="inline-flex min-h-[var(--touch-min)] items-center text-dark-text no-underline">
            {WORKSHOP.email}
          </a>
          <span className="text-dark-text-secondary">{t('footer.address')}</span>
        </div>
      </div>
    </footer>
  );
}
