'use client';

import { useTranslations } from 'next-intl';
import type { Price } from '@/lib/price';

/**
 * Расчёт рядом с ценой. Оговорка про ориентировочную цену стоит вплотную
 * к сумме — это условие владельца, а не оформление.
 */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-small text-ink-secondary">{label}</span>
      <span className="font-mono text-param text-ink">{value}</span>
    </div>
  );
}

export function PriceSummary({
  price,
  deliveryFee,
  leadTime,
  qty,
}: {
  price: Price;
  deliveryFee: number;
  leadTime: { fromDays: number; toDays: number };
  qty: number;
}) {
  const t = useTranslations();
  const grandTotal = price.total + deliveryFee;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface-sunken p-6">
      <div className="flex items-baseline justify-between gap-4">
        <span className="microlabel text-ink-secondary">{t('configurator.total')}</span>
        <span className="font-mono text-price text-ink">{grandTotal} ₾</span>
      </div>

      {price.isEstimate && (
        <p className="text-small text-ink-secondary">{t('price.estimate')}</p>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {qty > 1 && <Row label={t('configurator.perUnit')} value={`${price.unitPrice} ₾`} />}
        <Row label={t('configurator.profileMeters')} value={`${price.profileMeters.toFixed(2)} ${t('configurator.unitM')}`} />
        <Row label={t('configurator.weight')} value={`${price.weightKg.toFixed(1)} ${t('configurator.unitKg')}`} />
        <Row
          label={t('configurator.leadTime')}
          value={`${leadTime.fromDays}–${leadTime.toDays} ${t('configurator.days')}`}
        />
      </div>

      {price.suggestThickerProfile && (
        <p className="rounded-control bg-accent-subtle p-3 text-small text-ink">
          {t('configurator.thinProfile')}
        </p>
      )}
    </div>
  );
}
