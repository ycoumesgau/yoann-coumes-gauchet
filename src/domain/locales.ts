export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]

/** English is the default: an application link is read first by a recruiter. */
export const defaultLocale: Locale = 'en'

/** Each language's own name: a visitor looks for their language written in it. */
export const localeLabels: Readonly<Record<Locale, string>> = {
  en: 'English',
  fr: 'Français',
}

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value)
