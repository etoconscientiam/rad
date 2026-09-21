import { useTranslations } from 'next-intl';

/** Три шага. Номера моноширинные — это техданные, а не украшение. */
const STEPS = ['1', '2', '3'] as const;

export function HowItWorks() {
  const t = useTranslations();

  return (
    <section className="w-full py-14">
      <div className="mx-auto max-w-page px-4 md:px-6">
        <h2 className="text-h2">{t('how.title')}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {STEPS.map((n) => (
            <div key={n} className="flex flex-col gap-2 border-t border-border-strong pt-4">
              <span className="font-mono text-small text-ink-muted">0{n}</span>
              <h3 className="text-h3">{t(`how.step${n}`)}</h3>
              <p className="text-body text-ink-secondary">{t(`how.step${n}d`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
