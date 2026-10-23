'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { previewHref } from '@/domain/preview'

/**
 * In the live preview, reloads the page from the server each time `/admin`
 * saves the draft. `/admin` frames it on this same origin, so the messages
 * it accepts are the ones from here (Payload checks `event.origin`).
 */
export function RefreshOnSave() {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={typeof window === 'undefined' ? '' : window.location.origin}
    />
  )
}

/**
 * In the live preview, a click on a link to a page of the site opens that
 * page's preview: the public page refuses to be framed (`previewHref`).
 */
export function StayInPreview() {
  const router = useRouter()
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return
      const anchor = (event.target as Element | null)?.closest?.('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return
      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin) return
      const href = previewHref(url.pathname)
      if (!href) return
      event.preventDefault()
      router.push(href + url.hash)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [router])
  return null
}
