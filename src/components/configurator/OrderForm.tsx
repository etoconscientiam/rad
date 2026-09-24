'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { Button, Card, Icon, Input, SegmentControl } from '@/components/ds';
import type { OrderDraft } from '@/lib/orders/types';
import { validateDraft } from '@/lib/orders/validate';
import type { DeliveryMethod } from '@/lib/price';
import type { Locale } from '@/config/locales';

/**
 * Форма заявки. Отправляет только параметры изделия и контакты —
 * сумму считает сервер, здесь она нужна лишь чтобы показать клиенту.
 */

type Item = Omit<OrderDraft, 'customer' | 'delivery' | 'locale'>;

type Status = { kind: 'idle' | 'sending' | 'sent' | 'failed' | 'priceChanged' };

/**
 * Способ получения живёт снаружи: от него зависит доставка, а её обязан
 * видеть расчёт над формой. Иначе клиент соглашается на одну сумму,
 * а мастер получает другую.
 */
export type DeliveryChoice = { method: DeliveryMethod; address: string };

export function OrderForm({
  item,
  delivery,
  onDeliveryChange,
  quotedTotal,
}: {
  item: Item;
  delivery: DeliveryChoice;
  onDeliveryChange: (next: DeliveryChoice) => void;
  /** Сумма, показанная человеку. Сервер сверит её со своей. */
  quotedTotal: number;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const { method, address } = delivery;
  const setMethod = (next: DeliveryMethod) => onDeliveryChange({ ...delivery, method: next });
  const setAddress = (next: string) => onDeliveryChange({ ...delivery, address: next });
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const methodLabels: Record<DeliveryMethod, string> = {
    pickup: t('order.pickup'),
    delivery: t('order.delivery'),
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const draft: OrderDraft = {
      ...item,
      requestId,
      customer: {
        phone,
        ...(name.trim() ? { name } : {}),
        ...(email.trim() ? { email } : {}),
        ...(comment.trim() ? { comment } : {}),
      },
      delivery: { method, ...(method === 'delivery' ? { address } : {}) },
      locale,
      quotedTotal,
    };

    // Тот же модуль, что и на сервере. Гонять его здесь — не «доверять клиенту»,
    // а не заставлять человека ждать ответ ради ошибки, видной сразу.
    // Решение всё равно принимает сервер: он проверяет заново.
    const local = validateDraft(draft);
    if (local.errors.length) {
      setFieldErrors(local.errors);
      setStatus({ kind: 'idle' });
      return;
    }

    setStatus({ kind: 'sending' });
    setFieldErrors([]);

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
      const errors = body.errors ?? [];
      setFieldErrors(errors);
      if (response.status === 409) {
        setStatus({ kind: 'priceChanged' });
        return;
      }
      // Если 400 пришёл по полю, которого в форме нет, показать нечего —
      // без общего сообщения кнопка молча ничего не делает.
      const shown = errors.some((e) => e === 'phone' || e === 'address');
      setStatus(response.status === 400 && shown ? { kind: 'idle' } : { kind: 'failed' });
    } catch {
      setStatus({ kind: 'failed' });
    }
  }

  if (status.kind === 'sent') {
    return (
      <div className="flex flex-col items-start gap-4 rounded-card border border-success bg-success-subtle p-6">
        <p className="flex items-start gap-3 text-body text-ink">
          <Icon icon={Check} size={30} className="text-success" />
          <span>{t('order.success')}</span>
        </p>
        {/* Без этого второй заказ можно оформить только перезагрузкой страницы. */}
        <Button
          variant="secondary"
          onClick={() => {
            setRequestId(crypto.randomUUID());
            setStatus({ kind: 'idle' });
          }}
        >
          {t('order.again')}
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-4">
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
            maxLength={300}
            placeholder={t('order.addressPlaceholder')}
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
          maxLength={120}
          placeholder={t('order.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label={`${t('order.email')} · ${t('order.optional')}`}
          type="email"
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label={`${t('order.comment')} · ${t('order.optional')}`}
          maxLength={1000}
          placeholder={t('order.commentPlaceholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {status.kind === 'failed' && (
          <p className="flex items-start gap-2 text-small text-danger">
            <Icon icon={X} size={18} />
            <span>{t('order.failed')}</span>
          </p>
        )}
        {status.kind === 'priceChanged' && (
          <p className="flex items-start gap-2 text-small text-danger">
            <Icon icon={X} size={18} />
            <span>{t('order.errorPrice')}</span>
          </p>
        )}

          <Button type="submit" fullWidth disabled={status.kind === 'sending'}>
            {status.kind === 'sending' ? t('order.sending') : t('order.submit')}
          </Button>
      </form>
    </Card>
  );
}
