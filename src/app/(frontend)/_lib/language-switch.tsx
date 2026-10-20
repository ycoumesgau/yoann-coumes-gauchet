'use client'

import { localeCookie } from '@/domain/locale-routing'
import { localeLabels, locales, type Locale } from '@/domain/locales'

/**
 * EN | FR in the header, always visible. Following a link remembers the choice
 * in a cookie, exempt from consent as a choice of interface language (CNIL,
 * délibération n° 2020-091, traceurs de personnalisation de l'interface);
 * without JavaScript the link still changes language, it is only not
 * remembered. The visible code starts the accessible name (WCAG 2.5.3); the
 * language's own name follows, hidden from sight.
 */
export function LanguageSwitch({
  current,
  links,
}: {
  current: Locale
  links: Readonly<Record<Locale, string>>
}) {
  return (
    <div className="language-switch">
      {locales.map((locale) => {
        const label = (
          <>
            {locale.toUpperCase()}
            <span className="visually-hidden"> {localeLabels[locale]}</span>
          </>
        )
        return locale === current ? (
          <span key={locale} aria-current="page" lang={locale}>
            {label}
          </span>
        ) : (
          <a
            key={locale}
            href={links[locale]}
            hrefLang={locale}
            lang={locale}
            onClick={() => {
              const secure = window.location.protocol === 'https:' ? '; secure' : ''
              document.cookie = `${localeCookie}=${locale}; path=/; max-age=31536000; samesite=lax${secure}`
            }}
          >
            {label}
          </a>
        )
      })}
    </div>
  )
}
