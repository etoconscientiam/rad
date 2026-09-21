import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ds';
import { DEFAULT_LOCALE } from '@/config/locales';

/**
 * Hero на графите — одна из тёмных зон дизайн-системы.
 * Красный на тёмном берётся из --accent-on-dark, а не из --accent.
 */

/**
 * Размер заголовка зависит от языка: грузинская фраза заметно длиннее
 * русской и на общем размере переползает в четыре строки. Значения взяты
 * из прототипа (`STAL Prototype.dc.html`, строка 685), не придуманы.
 */
const HERO_SIZE: Record<string, string> = {
  ka: 'clamp(30px, 4.6vw, 46px)',
  ru: 'clamp(40px, 7vw, 64px)',
};

export function Hero() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="bg-graphite text-dark-text">
      <div className="mx-auto max-w-page px-4 pt-16 pb-14 md:px-6">
        <p className="microlabel font-mono text-dark-text-secondary">{t('brand.tagline')}</p>
        <h1
          className="mt-4 max-w-[720px] text-balance font-extrabold leading-[1.1] tracking-[-0.02em]"
          style={{ fontSize: HERO_SIZE[locale] ?? HERO_SIZE[DEFAULT_LOCALE] }}
        >
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
