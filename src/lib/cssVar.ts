/**
 * Значение токена дизайн-системы из CSS. Нужно там, где цвет уходит не в CSS,
 * а в three.js: сцена и материалы не должны заводить собственную палитру.
 */
export function cssVar(name: string, fallback = '#000000'): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
