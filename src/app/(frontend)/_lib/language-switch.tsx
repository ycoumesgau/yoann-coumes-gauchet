'use client'

import { usePathname } from 'next/navigation'

import { localeCookie, switchLocaleOfPath } from '@/domain/locale-routing'
import { localeLabels, locales, type Locale } from '@/domain/locales'

/**
 * EN | FR in the header, always visible. Following a link remembers the choice
 * (a language preference: no consent needed, CNIL exempted cookies); without
 * JavaScript the link still changes language, it is only not remembered.
 */
export function LanguageSwitch({ current }: { current: Locale }) {
  const pathname = usePathname() ?? `/${current}`
  return (
    <div className="language-switch">
      {locales.map((locale) =>
        locale === current ? (
          <span key={locale} aria-current="true" aria-label={localeLabels[locale]} lang={locale}>
            {locale.toUpperCase()}
          </span>
        ) : (
          <a
            key={locale}
            href={switchLocaleOfPath(pathname, locale)}
            hrefLang={locale}
            lang={locale}
            aria-label={localeLabels[locale]}
            onClick={() => {
              document.cookie = `${localeCookie}=${locale}; path=/; max-age=31536000; samesite=lax`
            }}
          >
            {locale.toUpperCase()}
          </a>
        ),
      )}
    </div>
  )
}
