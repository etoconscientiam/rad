'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button, Input, SegmentControl } from '@/components/ds';
import type { OrderDraft } from '@/lib/orders/types';
import type { DeliveryMethod } from '@/lib/price';
import type { Locale } from '@/config/locales';

/**
 * Форма заявки. Отправляет только параметры изделия и контакты —
 * сумму считает сервер, здесь она нужна лишь чтобы показать клиенту.
 */

type Item = Omit<OrderDraft, 'customer' | 'delivery' | 'locale'>;

type Status = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'failed' };

export function OrderForm({ item }: { item: Item }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [method, setMethod] = useState<DeliveryMethod>('pickup');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const methodLabels: Record<DeliveryMethod, string> = {
    pickup: t('order.pickup'),
    delivery: t('order.delivery'),
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus({ kind: 'sending' });
    setFieldErrors([]);

    const draft: OrderDraft = {
      ...item,
      customer: {
        phone,
        ...(name.trim() ? { name } : {}),
        ...(email.trim() ? { email } : {}),
        ...(comment.trim() ? { comment } : {}),
      },
      delivery: { method, ...(method === 'delivery' ? { address } : {}) },
      locale,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const body = (await response.json()) as { ok?: boolean; errors?: string[] };
      if (response.ok && body.ok) {
        setStatus({ kind: 'sent' });
        return;
      }
      setFieldErrors(body.errors ?? []);
      setStatus(response.status === 400 ? { kind: 'idle' } : { kind: 'failed' });
    } catch {
      setStatus({ kind: 'failed' });
    }
  }

  if (status.kind === 'sent') {
    return (
      <div className="rounded-card border border-success bg-success-subtle p-6">
        <p className="text-body text-ink">{t('order.success')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6"
    >
      <h2 className="text-h3">{t('order.title')}</h2>

      <SegmentControl
        label={t('order.receiving')}
        mono={false}
        options={[methodLabels.pickup, methodLabels.delivery]}
        value={methodLabels[method]}
        onChange={(label) => setMethod(label === methodLabels.delivery ? 'delivery' : 'pickup')}
      />

      {method === 'delivery' && (
        <Input
          label={t('order.address')}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={fieldErrors.includes('address') ? t('order.errorAddress') : undefined}
        />
      )}

      <Input
        label={t('order.phone')}
        type="tel"
        inputMode="tel"
        mono
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+995"
        error={fieldErrors.includes('phone') ? t('order.errorPhone') : undefined}
      />
      <Input
        label={`${t('order.name')} · ${t('order.optional')}`}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label={`${t('order.email')} · ${t('order.optional')}`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label={`${t('order.comment')} · ${t('order.optional')}`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {status.kind === 'failed' && <p className="text-small text-danger">{t('order.failed')}</p>}

      <Button type="submit" fullWidth disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? t('order.sending') : t('order.submit')}
      </Button>
    </form>
  );
}
