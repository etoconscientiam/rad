import { useTranslations } from 'next-intl';
import { Button } from '@/components/ds';

/**
 * Hero на графите — одна из тёмных зон дизайн-системы.
 * Красный на тёмном берётся из --accent-on-dark, а не из --accent.
 */
export function Hero() {
  const t = useTranslations();

  return (
    <section className="bg-graphite text-dark-text">
      <div className="mx-auto max-w-page px-4 pt-16 pb-14 md:px-6">
        <p className="microlabel font-mono text-dark-text-secondary">{t('brand.tagline')}</p>
        <h1 className="mt-4 max-w-[720px] text-balance text-h1 font-extrabold tracking-[-0.02em] md:text-display">
          {t('hero.title')}
        </h1>
        <p className="mt-5 max-w-[460px] text-body text-dark-text-secondary">
          {t('hero.subtitle')}
        </p>
        <div className="mt-8">
          <a href="#configurator" className="inline-block no-underline">
            <Button className="bg-[var(--accent-on-dark)] hover:bg-accent-hover">
              {t('hero.cta')}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
