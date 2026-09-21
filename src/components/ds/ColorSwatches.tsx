'use client';

import { cn } from '@/lib/cn';

/**
 * Свотчи отделки: круги 40px, у выбранного — кольцо 2px --accent с зазором 2px.
 * Подпись снизу обязательна: цвет никогда не единственный носитель смысла.
 *
 * Отличия от прототипа:
 * — aria-label группы приходит пропом. В прототипе он был захардкожен строкой
 *   «Цвет» и оставался русским на грузинской версии, а для ЛДСП был неверен.
 * — поле данных называется background, а не hex: туда кладут и цвет металла,
 *   и текстуру ЛДСП вида url("…") center/cover.
 *
 * gap 20 и круг 40 — значения прототипа, в шкале ДС их нет.
 */

export type SwatchOption = {
  value: string;
  /** Любое валидное значение CSS background: цвет металла или текстура ЛДСП. */
  background: string;
  name: string;
};

export type ColorSwatchesProps = {
  options: readonly SwatchOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** Цвет зазора между кругом и кольцом — совпадает с фоном под свотчем. */
  ringOffsetColor?: string;
  className?: string;
};

export function ColorSwatches({
  options,
  value,
  onChange,
  label,
  ringOffsetColor = 'var(--surface)',
  className,
}: ColorSwatchesProps) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex gap-5', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className="flex min-w-[var(--touch-min)] cursor-pointer flex-col items-center gap-2 border-none bg-none p-0.5"
          >
            <span
              className="size-10 rounded-full border border-border transition-shadow duration-150 ease-out"
              style={{
                background: option.background,
                boxShadow: active
                  ? `0 0 0 2px ${ringOffsetColor}, 0 0 0 4px var(--accent)`
                  : 'none',
              }}
            />
            <span
              className={cn(
                'text-small',
                active ? 'font-semibold text-ink' : 'font-normal text-ink-secondary',
              )}
            >
              {option.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
