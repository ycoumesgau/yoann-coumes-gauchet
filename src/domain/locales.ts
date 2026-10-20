export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]

/** English is the default: an application link is read first by a recruiter. */
export const defaultLocale: Locale = 'en'

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value)
