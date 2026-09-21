'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * Поле ввода дизайн-системы: фон --surface-sunken, лейбл сверху 13px,
 * фокус 2px --accent, ошибка под полем.
 *
 * Отличие от прототипа: фокус на CSS-псевдоклассе вместо React-стейта,
 * и ошибка связана с полем через aria-describedby и aria-invalid.
 *
 * Значения вне шкалы ДС, снятые с прототипа: gap 6, padding 14.
 */

export type InputProps = {
  label?: string;
  /** Моноширинный — для чисел и технических значений. */
  mono?: boolean;
  suffix?: string;
  error?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;

export function Input({ label, mono, suffix, error, className, id, ...rest }: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={fieldId} className="text-small text-ink-secondary">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex h-[var(--control-h)] items-center rounded-control border px-3.5',
          'bg-surface-sunken transition-colors duration-150 ease-out',
          'focus-within:shadow-[inset_0_0_0_1px_currentColor]',
          error
            ? 'border-danger text-danger shadow-[inset_0_0_0_1px_currentColor]'
            : 'border-border-strong text-accent focus-within:border-accent',
        )}
      >
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'min-w-0 flex-1 border-none bg-transparent text-ink outline-none',
            mono ? 'font-mono text-param font-medium' : 'font-sans text-body font-normal',
          )}
          {...rest}
        />
        {suffix && <span className="ml-2 font-mono text-small text-ink-muted">{suffix}</span>}
      </div>
      {error && (
        <div id={errorId} className="text-small text-danger">
          {error}
        </div>
      )}
    </div>
  );
}
