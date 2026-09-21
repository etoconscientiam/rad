'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/cn';

/**
 * Слайдер размера: трек 4px, заполнение --accent, ручка 24px, лимиты моно под треком.
 * Слайдер всегда продублирован числовым вводом — правило ДС.
 *
 * Значения вне шкалы ДС, снятые с прототипа (токенов под них нет):
 * высота пилюли 36, её padding 10 и gap 6, ширина ввода 48, размер единиц 12,
 * ручка 24, трек 4 / радиус 2.
 *
 * Отличие от прототипа: зона касания трека поднята с 32px до --touch-min (44).
 * Прототип нарушал здесь собственное правило ДС, а это главный контрол
 * конфигуратора на телефоне. Видимый трек остался 4px.
 */

export type SizeSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
};

export function SizeSlider({
  label,
  value,
  onChange,
  min = 200,
  max = 2000,
  step = 10,
  unit = 'мм',
  className,
}: SizeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  /** Черновик ввода: пока не null — поле показывает набранное, модель не трогаем. */
  const [draft, setDraft] = useState<string | null>(null);

  // Сначала квантование по шагу, затем зажим в границы — порядок как в прототипе.
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const pct = ((value - min) / (max - min)) * 100;

  const setFromX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    onChange(clamp(min + ((clientX - rect.left) / rect.width) * (max - min)));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    setFromX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const commitDraft = () => {
    const n = Number.parseInt(draft ?? '', 10);
    if (!Number.isNaN(n)) onChange(clamp(n));
    setDraft(null);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="microlabel text-ink-secondary">{label}</span>
        <span className="flex h-9 items-center gap-1.5 rounded-control border border-border-strong bg-surface-sunken px-2.5">
          <input
            value={draft ?? value}
            inputMode="numeric"
            aria-label={label}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="w-12 border-none bg-transparent text-right font-mono text-param text-ink outline-none"
          />
          <span className="font-mono text-[12px] text-ink-muted">{unit}</span>
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} ${unit}`}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => dragging && setFromX(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onKeyDown={(e) => {
          const delta =
            e.key === 'ArrowLeft' || e.key === 'ArrowDown'
              ? -step
              : e.key === 'ArrowRight' || e.key === 'ArrowUp'
                ? step
                : 0;
          if (delta === 0 && e.key !== 'Home' && e.key !== 'End') return;
          e.preventDefault();
          if (e.key === 'Home') onChange(clamp(min));
          else if (e.key === 'End') onChange(clamp(max));
          else onChange(clamp(value + delta));
        }}
        className="relative flex h-[var(--touch-min)] cursor-pointer touch-none items-center"
      >
        <div className="absolute inset-x-0 h-1 rounded-[2px] bg-border" />
        <div
          className="absolute left-0 h-1 rounded-[2px] bg-accent"
          style={{ width: `${pct}%` }}
        />
        <div
          className={cn(
            'absolute size-6 -translate-x-1/2 rounded-full border-2 box-border',
            // --accent-on — единственный чистый белый в системе (#FFFFFF).
            'bg-accent-on',
            dragging ? 'border-accent' : 'border-border-strong transition-colors duration-150 ease-out',
          )}
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between font-mono text-microlabel text-ink-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
