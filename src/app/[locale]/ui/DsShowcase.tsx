'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, ColorSwatches, SegmentControl, SizeSlider } from '@/components/ds';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { LDSP_FINISHES, METAL_FINISHES, MODELS, PROFILE_OPTIONS, SIZE_STEP } from '@/config/catalog';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-border bg-surface p-6">
      <h2 className="mb-6 text-h3">{title}</h2>
      {children}
    </section>
  );
}

export function DsShowcase() {
  const t = useTranslations();
  const cube = MODELS.cube;

  const [height, setHeight] = useState(cube.defaults.h);
  const [profile, setProfile] = useState(PROFILE_OPTIONS[1] ?? '');
  const [metal, setMetal] = useState<string>(METAL_FINISHES[0].value);
  const [wood, setWood] = useState<string>(LDSP_FINISHES[0].value);

  const metalOptions = METAL_FINISHES.map((f) => ({
    value: f.value,
    background: f.token,
    name: t(`colors.${f.value}`),
  }));

  const woodOptions = LDSP_FINISHES.map((f) => ({
    value: f.value,
    // Текстур ещё нет — до понедельника показываем оттенок из каталога.
    background: f.tint,
    name: t(`woods.${f.value}`),
  }));

  return (
    <main className="mx-auto max-w-page px-4 py-12 md:px-6">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">{t('ds.title')}</h1>
          <p className="mt-2 text-small text-ink-secondary">{t('ds.subtitle')}</p>
        </div>
        <LocaleSwitcher />
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title={t('ds.button')}>
          <div className="flex flex-wrap items-center gap-4">
            <Button>{t('ds.variantPrimary')}</Button>
            <Button variant="secondary">{t('ds.variantSecondary')}</Button>
            <Button variant="ghost">{t('ds.variantGhost')}</Button>
            <Button disabled>{t('ds.stateDisabled')}</Button>
            <Button size="sm" variant="secondary">
              {t('ds.sizeSm')}
            </Button>
          </div>
          <div className="mt-4">
            <Button fullWidth price={420}>
              {t('configurator.order')}
            </Button>
          </div>
          <p className="mt-3 text-small text-ink-muted">{t('price.estimate')}</p>
        </Section>

        <Section title={t('ds.sizeSlider')}>
          <SizeSlider
            label={t('configurator.height')}
            unit={t('configurator.unitMm')}
            min={cube.ranges.h.min}
            max={cube.ranges.h.max}
            step={SIZE_STEP}
            value={height}
            onChange={setHeight}
          />
        </Section>

        <Section title={t('ds.segmentControl')}>
          <SegmentControl
            label={t('configurator.profileSection')}
            options={PROFILE_OPTIONS}
            value={profile}
            onChange={setProfile}
          />
        </Section>

        <Section title={t('ds.colorSwatches')}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="microlabel text-ink-secondary">{t('configurator.metalColor')}</span>
              <ColorSwatches
                label={t('configurator.metalColor')}
                options={metalOptions}
                value={metal}
                onChange={setMetal}
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="microlabel text-ink-secondary">{t('configurator.ldsp')}</span>
              <ColorSwatches
                label={t('configurator.ldsp')}
                options={woodOptions}
                value={wood}
                onChange={setWood}
              />
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
