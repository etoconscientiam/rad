/** Склейка классов. Отдельной зависимости ради этого не заводим. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
