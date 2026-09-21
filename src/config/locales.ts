/** Языки сайта. Единственный список — добавление локали здесь плюс файл словаря. */

/** Активные локали. Английский вынесен из спринта решением владельца 20.09.2026. */
export const LOCALES = ['ka', 'ru'] as const;

/** Грузинский по умолчанию — так в прототипе. */
export const DEFAULT_LOCALE = 'ka' satisfies (typeof LOCALES)[number];

/**
 * Запланированные, но не включённые локали. Возврат английского =
 * перенос 'en' в LOCALES плюс src/messages/en.json. Кода это не касается.
 */
export const PLANNED_LOCALES = ['en'] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
