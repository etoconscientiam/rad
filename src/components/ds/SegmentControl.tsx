'use client';

import { cn } from '@/lib/cn';

/**
 * Сегмент-контрол (например, сечение профиля).
 * Активный сегмент заливается --ink, а не красным: это выбор, а не действие.
 *
 * Отличие от прототипа: у контейнера overflow-hidden, поэтому фокус-кольцо из
 * base.css обрезалось. Рисуем его внутрь через отрицательный outline-offset.
 */

export type SegmentControlProps = {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Моноширинный шрифт — для чисел и технических значений. */
  mono?: boolean;
  label?: string;
  className?: string;
};

export function SegmentControl({
  options,
  value,
  onChange,
  mono = true,
  label,
  className,
}: SegmentControlProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="microlabel text-ink-secondary">{label}</span>}
      <div
        role="radiogroup"
        aria-label={label}
        className="flex overflow-hidden rounded-control border border-border-strong bg-surface"
      >
        {options.map((option, i) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={cn(
                'h-11 flex-1 cursor-pointer border-none',
                'transition-[background-color,color] duration-150 ease-out',
                'focus-visible:outline-offset-[-2px]',
                i > 0 && 'border-l border-border',
                // --accent-on — единственный чистый белый в системе (#FFFFFF).
                active ? 'bg-ink text-accent-on' : 'bg-transparent text-ink-secondary',
                mono ? 'font-mono text-[14px] font-medium' : 'font-sans text-param font-semibold',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
