'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { FrameLabels } from './render-blocks'

export type Screen = {
  src: string
  alt: string
  width: number
  height: number
  caption: string | null
  tag: string | null
}

/**
 * Screenshots that open larger on click, one viewer per group: Escape closes,
 * the arrows move through the group, focus returns to the shot that opened it.
 */
export function Screens({
  screens,
  labels,
  grid = false,
}: {
  screens: Screen[]
  labels: FrameLabels
  grid?: boolean
}) {
  const [open, setOpen] = useState<number | null>(null)
  const openers = useRef<(HTMLButtonElement | null)[]>([])
  const closeButton = useRef<HTMLButtonElement | null>(null)
  const dialog = useRef<HTMLDivElement | null>(null)
  // Without the words to close it, the viewer is not offered at all.
  const viewer = Boolean(labels.close)
  const count = screens.length

  const close = useCallback(() => {
    setOpen((current) => {
      if (current !== null) openers.current[current]?.focus()
      return null
    })
  }, [])
  const move = useCallback(
    (step: number) =>
      setOpen((current) => (current === null ? null : (current + step + count) % count)),
    [count],
  )

  useEffect(() => {
    if (open === null) return
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') move(1)
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'Tab') {
        // Keep focus inside the viewer while it is open.
        const buttons = [...(dialog.current?.querySelectorAll('button') ?? [])]
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        const inside = buttons.includes(document.activeElement as HTMLButtonElement)
        if (event.shiftKey && (document.activeElement === first || !inside)) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && (document.activeElement === last || !inside)) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, close, move])

  const shown = open === null ? null : screens[open]
  const items = screens.map((screen, i) => (
    <figure key={screen.src + i} style={{ margin: 0 }}>
      {viewer ? (
        <button
          type="button"
          className="shot"
          ref={(node) => {
            openers.current[i] = node
          }}
          onClick={() => setOpen(i)}
          title={labels.viewLarger ?? undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- served by Payload, opened full size */}
          <img
            src={screen.src}
            alt={screen.alt}
            width={screen.width}
            height={screen.height}
            data-tall={screen.height > screen.width ? '' : undefined}
            loading="lazy"
          />
          {screen.tag ? <span className="tag">{screen.tag}</span> : null}
        </button>
      ) : (
        <span className="shot">
          {/* eslint-disable-next-line @next/next/no-img-element -- served by Payload */}
          <img
            src={screen.src}
            alt={screen.alt}
            width={screen.width}
            height={screen.height}
            data-tall={screen.height > screen.width ? '' : undefined}
            loading="lazy"
          />
          {screen.tag ? <span className="tag">{screen.tag}</span> : null}
        </span>
      )}
      {screen.caption ? <figcaption className="caption">{screen.caption}</figcaption> : null}
    </figure>
  ))

  return (
    <>
      {grid ? <div className="gallery">{items}</div> : items}
      {shown ? (
        <div
          ref={dialog}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={shown.caption ?? shown.alt}
          onClick={close}
        >
          <div className="lightbox-top">
            <span>{count > 1 ? `${(open ?? 0) + 1} / ${count}` : ''}</span>
            <button type="button" ref={closeButton} onClick={close}>
              {labels.close}
            </button>
          </div>
          <div className="lightbox-stage">
            {/* eslint-disable-next-line @next/next/no-img-element -- full-size view of the same file */}
            <img src={shown.src} alt={shown.alt} onClick={(event) => event.stopPropagation()} />
          </div>
          <div className="lightbox-bottom" onClick={(event) => event.stopPropagation()}>
            {count > 1 ? (
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label={labels.previous ?? undefined}
              >
                ←
              </button>
            ) : (
              <span />
            )}
            <span>{shown.caption ?? shown.alt}</span>
            {count > 1 ? (
              <button type="button" onClick={() => move(1)} aria-label={labels.next ?? undefined}>
                →
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
