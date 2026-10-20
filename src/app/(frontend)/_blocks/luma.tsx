'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState, useSyncExternalStore } from 'react'

import { resolveStateMachine } from '@/domain/luma'

const LumaCanvas = dynamic(() => import('./luma-canvas'), { ssr: false })

export type LumaStill = { src: string; alt: string; width: number; height: number }

const reducedMotion = '(prefers-reduced-motion: reduce)'
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(reducedMotion)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** Motion is allowed only once the browser says so: the server renders the still. */
function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => !window.matchMedia(reducedMotion).matches,
    () => false,
  )
}

/**
 * Luma, Licorn's mascot, alive in the page from its Rive file (FILM 6): she
 * blinks at rest, changes face on hover, keyboard focus or touch, and "talks"
 * for a few seconds on a click, without sound (a synthetic mouth pattern).
 * Reduced motion shows the still image only; so does the time before the
 * canvas is ready, and a file or runtime that fails to load.
 */
export function Luma({
  src,
  stateMachine,
  fallback,
  caption,
}: {
  /** URL of the `.riv` file. */
  src: string
  /** The block's state machine; Luma's own (`LumaFace`) when empty. */
  stateMachine?: string | null
  fallback: LumaStill
  caption?: string | null
}) {
  const motion = useMotionAllowed()
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const live = motion && !failed
  const shown = live && ready

  return (
    <figure className="rive-stage" style={{ margin: 0 }}>
      <Image
        src={fallback.src}
        alt={fallback.alt}
        width={fallback.width}
        height={fallback.height}
        sizes="420px"
        aria-hidden={shown ? true : undefined}
        style={shown ? { visibility: 'hidden' } : undefined}
      />
      {live ? (
        <LumaCanvas
          src={src}
          stateMachine={resolveStateMachine(stateMachine)}
          label={fallback.alt}
          ready={ready}
          onReady={setReady}
          onFail={() => setFailed(true)}
        />
      ) : null}
      {caption ? <figcaption className="visually-hidden">{caption}</figcaption> : null}
    </figure>
  )
}
