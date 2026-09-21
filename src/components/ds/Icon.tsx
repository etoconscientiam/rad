import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Линейная иконка Lucide, stroke 1.5px. Единственный допустимый источник
 * иконок в проекте: своих SVG не рисуем, эмодзи не используем.
 *
 * Отличие от прототипа: там компонент тянул SVG с unpkg по имени иконки.
 * У нас lucide-react стоит пакетом, а иконка передаётся компонентом —
 * так не уезжает внешний запрос и в бандл попадает только использованное.
 */

export type IconProps = {
  icon: LucideIcon;
  /** Размер в пикселях. 20 — значение прототипа. */
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ icon: Glyph, size = 20, strokeWidth = 1.5, className }: IconProps) {
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={cn('inline-flex shrink-0', className)}
    />
  );
}
