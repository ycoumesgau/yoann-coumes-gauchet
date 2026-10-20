'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

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
  title: string | null
  provider: string
  notice: string | null
  aspect: 'vertical' | 'player'
  poster?: ReactNode
}) {
  const [loaded, setLoaded] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)
  // The button the visitor pressed is gone: keyboard focus moves to the player.
  useEffect(() => {
    if (loaded) frame.current?.focus()
  }, [loaded])
  if (loaded) {
    return (
      <iframe
        ref={frame}
        className={`embed embed-${aspect}`}
        src={src}
        title={title ?? provider}
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
        {title ? (
          <>
            {title}
            <span className="embed-provider"> · {provider}</span>
          </>
        ) : (
          provider
        )}
      </button>
      {notice ? <p className="embed-notice">{notice}</p> : null}
    </div>
  )
}
