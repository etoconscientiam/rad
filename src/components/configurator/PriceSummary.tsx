'use client';

import { useTranslations } from 'next-intl';
import { Button, Price as PriceTag } from '@/components/ds';
import type { Price } from '@/lib/price';

/**
 * Расчёт рядом с ценой. Оговорка про ориентировочную цену стоит вплотную
 * к сумме — это условие владельца, а не оформление.
 */

function Row({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div data-testid={testId} className="flex items-baseline justify-between gap-4">
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
  onApplyThickerProfile,
}: {
  price: Price;
  deliveryFee: number;
  leadTime: { fromDays: number; toDays: number };
  qty: number;
  /** Применить рекомендованное сечение прямо из предупреждения. */
  onApplyThickerProfile: () => void;
}) {
  const t = useTranslations();
  const grandTotal = price.total + deliveryFee;

  return (
    <div
      data-testid="price-summary"
      className="flex flex-col gap-3 rounded-card border border-border bg-surface-sunken p-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="microlabel text-ink-secondary">{t('configurator.total')}</span>
        <span data-testid="grand-total">
          <PriceTag value={grandTotal} />
        </span>
      </div>

      {price.isEstimate && (
        <p className="text-small text-ink-secondary">{t('price.estimate')}</p>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {qty > 1 && (
          <Row testId="unit-price" label={t('configurator.perUnit')} value={`${price.unitPrice} ₾`} />
        )}
        {deliveryFee > 0 && (
          <Row testId="delivery-fee" label={t('order.delivery')} value={`${deliveryFee} ₾`} />
        )}
        <Row
          testId="profile-meters"
          label={t('configurator.profileMeters')}
          value={`${price.profileMeters.toFixed(2)} ${t('configurator.unitM')}`}
        />
        <Row
          testId="weight"
          label={t('configurator.weight')}
          value={`${price.weightKg.toFixed(1)} ${t('configurator.unitKg')}`}
        />
        <Row
          testId="lead-time"
          label={t('configurator.leadTime')}
          value={`${leadTime.fromDays}–${leadTime.toDays} ${t('configurator.days')}`}
        />
      </div>

      {price.suggestThickerProfile && (
        <div
          data-testid="thin-profile"
          className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-accent-subtle p-3"
        >
          <p className="flex-1 text-small text-ink">{t('configurator.thinProfile')}</p>
          <Button size="sm" variant="secondary" onClick={onApplyThickerProfile}>
            {t('configurator.applyProfile')}
          </Button>
        </div>
      )}
    </div>
  );
}
