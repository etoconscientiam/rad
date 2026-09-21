'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Кнопка дизайн-системы «Каркас».
 * Primary — единственный красный элемент экран-зоны. С ценой: «Заказать · 420 ₾».
 *
 * Отличие от прототипа: hover сделан на CSS вместо React-стейта и мышиных
 * событий — на тач-устройствах JS-hover не срабатывал, а :focus-visible
 * приходит из base.css.
 */

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-on border-transparent hover:bg-accent-hover active:bg-accent-hover ' +
    'disabled:bg-surface-sunken disabled:text-ink-muted disabled:hover:bg-surface-sunken',
  secondary:
    'bg-transparent text-ink border-border-strong hover:bg-surface-sunken ' +
    'disabled:text-ink-muted disabled:border-border disabled:hover:bg-transparent',
  ghost:
    'bg-transparent text-ink-secondary border-transparent hover:bg-surface-sunken ' +
    'disabled:text-ink-muted disabled:hover:bg-transparent',
};

const SIZE: Record<Size, string> = {
  // 48px = --control-h. 16px = --body-size.
  md: 'h-[var(--control-h)] text-body',
  // 40px и 14px — значения прототипа, в шкале ДС их нет. 40 < --touch-min (44).
  sm: 'h-10 text-[14px]',
};

export type ButtonProps = {
  variant?: Variant;
  size?: Size;
  price?: number | string | null;
  fullWidth?: boolean;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function Button({
  variant = 'primary',
  size = 'md',
  price,
  fullWidth,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-6',
        'rounded-control border font-sans font-semibold',
        'cursor-pointer disabled:cursor-default',
        'transition-[background-color,border-color] duration-150 ease-out',
        SIZE[size],
        VARIANT[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
      {price != null && <span className="font-mono font-semibold">· {price} ₾</span>}
    </button>
  );
}
