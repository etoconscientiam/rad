import { cn } from '@/lib/cn';

/**
 * Цена: JetBrains Mono 600, красная. Красный здесь — акцент суммы,
 * как в прототипе; muted переводит её в основной цвет текста.
 */

export type PriceProps = {
  value: number | string;
  currency?: string;
  /** Приглушённая цена — цветом --ink вместо акцента. */
  muted?: boolean;
  className?: string;
};

export function Price({ value, currency = '₾', muted, className }: PriceProps) {
  return (
    <span
      className={cn(
        'whitespace-nowrap font-mono text-price leading-[1.1]',
        muted ? 'text-ink' : 'text-accent',
        className,
      )}
    >
      {typeof value === 'number' ? value.toLocaleString('ru-RU') : value} {currency}
    </span>
  );
}
