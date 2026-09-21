import { cn } from '@/lib/cn';

/**
 * Чип статуса заказа. Статус несёт цвет, но не смысл: подпись обязательна,
 * потому что цвет не может быть единственным носителем информации.
 *
 * Текст приходит извне — подписи статусов живут в словарях, не здесь.
 */

export type OrderStatus =
  | 'awaiting-payment'
  | 'received'
  | 'production'
  | 'ready'
  | 'delivery'
  | 'pickup'
  | 'done'
  | 'cancelled';

const TONE: Record<OrderStatus, string> = {
  'awaiting-payment': 'border-warning text-warning',
  received: 'border-transparent bg-accent-subtle text-accent',
  production: 'border-ink-secondary text-ink-secondary',
  ready: 'border-transparent bg-success-subtle text-success',
  delivery: 'border-border-strong text-ink-secondary',
  pickup: 'border-border-strong text-ink-secondary',
  done: 'border-border text-ink-muted',
  cancelled: 'border-transparent text-danger',
};

export type StatusChipProps = {
  status: OrderStatus;
  children: string;
  className?: string;
};

export function StatusChip({ status, children, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center whitespace-nowrap rounded-full border px-3',
        'font-mono text-[12px] font-medium',
        TONE[status],
        className,
      )}
    >
      {children}
    </span>
  );
}
