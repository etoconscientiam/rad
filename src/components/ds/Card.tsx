import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Карточка: фон --surface, бордер 1px, радиус 12px. Закрытый блок —
 * поверхность, отступ и скругление принадлежат ему, а не потребителю.
 */

export type CardProps = {
  children: ReactNode;
  /** Кликабельная карточка подсвечивает бордер при наведении. */
  onClick?: () => void;
  className?: string;
};

export function Card({ children, onClick, className }: CardProps) {
  const content = (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-border bg-surface p-6',
        'transition-colors duration-150 ease-out',
        onClick && 'cursor-pointer hover:border-border-strong',
        className,
      )}
    >
      {children}
    </div>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  ) : (
    content
  );
}
