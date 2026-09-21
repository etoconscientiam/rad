'use client';

import type { LucideIcon } from 'lucide-react';
import { Icon } from './Icon';
import { cn } from '@/lib/cn';

/**
 * Ghost-иконка 40×40: контролы вьюпорта, тулбары.
 * Активная заливается --ink, а не красным: это выбор, а не действие.
 *
 * 40px меньше --touch-min (44) — так в дизайн-системе. Для тач-сценариев
 * проверять отдельно.
 */

export type IconButtonProps = {
  icon: LucideIcon;
  /** Обязателен: кнопка без текста должна называть себя скринридеру. */
  label: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
};

export function IconButton({ icon, label, onClick, active, className }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        'inline-flex size-10 cursor-pointer items-center justify-center',
        'rounded-control border border-transparent',
        'transition-colors duration-150 ease-out',
        active
          ? 'bg-ink text-accent-on'
          : 'bg-transparent text-ink-secondary hover:bg-surface-sunken',
        className,
      )}
    >
      <Icon icon={icon} />
    </button>
  );
}
