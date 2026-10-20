'use client'

import { useState, type ReactNode } from 'react'

/**
 * A third-party player that loads only when the visitor asks for it (ADR-4):
 * until the click, the page requests nothing from the provider, so it sets no
 * cookie and needs no consent banner. The button is named by the content.
 */
export function EmbedFacade({
  src,
  title,
  provider,
  notice,
  aspect,
  poster,
}: {
  src: string
  title: string
  provider: string
  notice: string | null
  aspect: 'vertical' | 'player'
  poster?: ReactNode
}) {
  const [loaded, setLoaded] = useState(false)
  if (loaded) {
    return (
      <iframe
        className={`embed embed-${aspect}`}
        src={src}
        title={title}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    )
  }
  return (
    <div className={`embed embed-${aspect} embed-facade`}>
      {poster}
      <button type="button" onClick={() => setLoaded(true)}>
        <span aria-hidden="true">▶ </span>
        {title}
        <span className="embed-provider"> · {provider}</span>
      </button>
      {notice ? <p className="embed-notice">{notice}</p> : null}
    </div>
  )
}
