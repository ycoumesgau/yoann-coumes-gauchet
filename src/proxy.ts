import { NextResponse, type NextRequest } from 'next/server'

import { localeCookie, localeOfPath, negotiateLocale } from '@/domain/locale-routing'

/**
 * Sends a path without a language to the visitor's language: `/` → `/en` or
 * `/fr`. Each language keeps its own URL so search engines, which send no
 * `Accept-Language`, index both (`hreflang` in the page metadata).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (localeOfPath(pathname)) return NextResponse.next()

  const locale = negotiateLocale({
    cookie: request.cookies.get(localeCookie)?.value ?? null,
    acceptLanguage: request.headers.get('accept-language'),
  })
  const target = new URL(`/${locale}${pathname === '/' ? '' : pathname}${search}`, request.url)
  const response = NextResponse.redirect(target, 307)
  // The answer depends on both; a cache must not hand one visitor's language to another.
  response.headers.set('Vary', 'Accept-Language, Cookie')
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = {
  // Everything but the admin, the APIs, OAuth and Next's own files (whole first
  // segments: `/api-design` is a page), and files with an extension.
  matcher: ['/((?!(?:admin|api|oauth|\\.well-known|_next)(?:/|$)|.*\\..*).*)'],
}
