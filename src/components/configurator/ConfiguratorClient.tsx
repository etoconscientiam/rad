'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ColorSwatches, Input, SegmentControl, SizeSlider } from '@/components/ds';
import { cssVar } from '@/lib/cssVar';
import { calculatePrice, deliveryFee, leadTime } from '@/lib/price';
import { MAX_QTY } from '@/config/pricing';
import { PriceSummary } from './PriceSummary';
import { OrderForm, type DeliveryChoice } from './OrderForm';
import {
  ACTIVE_MODELS,
  LDSP_FINISHES,
  METAL_FINISHES,
  MODELS,
  PROFILE_OPTIONS,
  SIZE_STEP,
  profileFromLabel,
  profileLabel,
  type ModelCode,
} from '@/config/catalog';

// Canvas умеет работать только в браузере — на сервере его рендерить нечем.
const Frame3D = dynamic(() => import('./Frame3D').then((m) => m.Frame3D), {
  ssr: false,
  loading: () => <div className="size-full bg-surface-sunken" />,
});

export function ConfiguratorClient() {
  const t = useTranslations();

  const [model, setModel] = useState<ModelCode>('cube');
  const [size, setSize] = useState(MODELS.cube.defaults);
  const [qty, setQty] = useState(1);
  /** Черновик поля количества: пока не null, показываем набранное. */
  const [qtyDraft, setQtyDraft] = useState<string | null>(null);
  const [metal, setMetal] = useState<string>(METAL_FINISHES[0].value);
  const [wood, setWood] = useState<string>(LDSP_FINISHES[0].value);
  // Способ получения нужен и форме, и расчёту: доставка входит в итог.
  const [delivery, setDelivery] = useState<DeliveryChoice>({ method: 'pickup', address: '' });

  const spec = MODELS[model];

  /** Смена модели: размеры берутся из её умолчаний, чужие диапазоны не тянем. */
  const selectModel = (code: ModelCode) => {
    setModel(code);
    setSize(MODELS[code].defaults);
  };

  const metalFinish = METAL_FINISHES.find((f) => f.value === metal) ?? METAL_FINISHES[0];
  const woodFinish = LDSP_FINISHES.find((f) => f.value === wood) ?? LDSP_FINISHES[0];

  const modelNames = useMemo(
    () => ACTIVE_MODELS.map((code) => ({ code, name: t(`models.${code}`) })),
    [t],
  );

  // Цена на клиенте — только чтобы её показать. Сервер считает заново.
  const price = calculatePrice({ model, ...size, qty });
  const fee = deliveryFee(qty, delivery.method);

  return (
    <section id="configurator" className="w-full scroll-mt-16 py-14">
      <div className="mx-auto max-w-page px-4 md:px-6">
      <h2 className="mb-6 text-h2">{t('configurator.title')}</h2>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border bg-surface-sunken lg:aspect-auto lg:h-[560px]">
            <Frame3D
              className="size-full"
              model={model}
              h={size.h}
              w={size.w}
              l={size.l}
              profile={size.profile}
              color={cssVar(metalFinish.token)}
              wood={woodFinish.tint}
              woodTexture={spec.hasLdsp ? woodFinish.texture : null}
            />
            <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-[12px] font-medium text-ink-secondary">
              {size.l}×{size.w}×{size.h} {t('configurator.unitMm')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-6 rounded-card border border-border bg-surface p-6">
            <SegmentControl
              label={t('configurator.model')}
              mono={false}
              options={modelNames.map((m) => m.name)}
              value={t(`models.${model}`)}
              onChange={(name) => {
                const found = modelNames.find((m) => m.name === name);
                if (found) selectModel(found.code);
              }}
            />

            <SizeSlider
              label={t('configurator.height')}
              unit={t('configurator.unitMm')}
              min={spec.ranges.h.min}
              max={spec.ranges.h.max}
              step={SIZE_STEP}
              value={size.h}
              onChange={(h) => setSize((s) => ({ ...s, h }))}
            />
            <SizeSlider
              label={t('configurator.width')}
              unit={t('configurator.unitMm')}
              min={spec.ranges.w.min}
              max={spec.ranges.w.max}
              step={SIZE_STEP}
              value={size.w}
              onChange={(w) => setSize((s) => ({ ...s, w }))}
            />
            <SizeSlider
              label={t('configurator.length')}
              unit={t('configurator.unitMm')}
              min={spec.ranges.l.min}
              max={spec.ranges.l.max}
              step={SIZE_STEP}
              value={size.l}
              onChange={(l) => setSize((s) => ({ ...s, l }))}
            />

            <SegmentControl
              label={t('configurator.profileSection')}
              options={PROFILE_OPTIONS}
              value={profileLabel(size.profile)}
              onChange={(label) => {
                const profile = profileFromLabel(label);
                if (profile) setSize((s) => ({ ...s, profile }));
              }}
            />

            <div className="flex flex-col gap-2">
              <span className="microlabel text-ink-secondary">{t('configurator.metalColor')}</span>
              <ColorSwatches
                label={t('configurator.metalColor')}
                options={METAL_FINISHES.map((f) => ({
                  value: f.value,
                  background: `var(${f.token})`,
                  name: t(`colors.${f.value}`),
                }))}
                value={metal}
                onChange={setMetal}
              />
            </div>

            {spec.hasLdsp && (
              <div className="flex flex-col gap-2">
                <span className="microlabel text-ink-secondary">{t('configurator.ldsp')}</span>
                <ColorSwatches
                  label={t('configurator.ldsp')}
                  options={LDSP_FINISHES.map((f) => ({
                    value: f.value,
                    background: `url("${f.texture}") center/cover`,
                    name: t(`woods.${f.value}`),
                  }))}
                  value={wood}
                  onChange={setWood}
                />
              </div>
            )}

            <Input
              label={t('configurator.quantity')}
              mono
              inputMode="numeric"
              suffix={t('configurator.pcs')}
              value={qtyDraft ?? qty}
              onChange={(e) => setQtyDraft(e.target.value)}
              onBlur={() => {
                const n = Number.parseInt(qtyDraft ?? '', 10);
                if (!Number.isNaN(n)) setQty(Math.min(MAX_QTY, Math.max(1, n)));
                setQtyDraft(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </section>

          <PriceSummary
            price={price}
            deliveryFee={fee}
            leadTime={leadTime(qty)}
            qty={qty}
          />

          <OrderForm
            item={{
              model,
              ...size,
              qty,
              metalColor: metal,
              ...(spec.hasLdsp ? { ldspColor: wood } : {}),
            }}
            delivery={delivery}
            onDeliveryChange={setDelivery}
          />
          </div>
        </div>
      </div>
    </section>
  );
}
