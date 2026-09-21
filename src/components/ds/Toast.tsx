'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Плашка сообщения на графите. Без иконок-мультяшек — только текст и действие. */
export type ToastProps = {
  children: ReactNode;
  action?: string;
  onAction?: () => void;
  className?: string;
};

export function Toast({ children, action, onAction, className }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        'inline-flex max-w-[420px] items-center gap-5 rounded-card',
        'bg-graphite px-5 py-3.5 text-[14px] leading-[1.4] text-dark-text',
        className,
      )}
    >
      <span>{children}</span>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="cursor-pointer whitespace-nowrap border-none bg-none p-0 font-sans text-[14px] font-bold text-[var(--accent-on-dark)]"
        >
          {action}
        </button>
      )}
    </div>
  );
}
