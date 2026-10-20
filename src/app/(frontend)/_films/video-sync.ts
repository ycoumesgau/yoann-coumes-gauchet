'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * A cut of a real screen capture: from film time `at`, for `length` seconds,
 * play video `video` from its second `from` at `rate`.
 */
export type Cut = {
  video: string
  at: number
  length: number
  from: number
  rate: number
}

/** The cut on screen at `t`; past the end, the last one. */
export const cutAt = (cuts: readonly Cut[], t: number): Cut =>
  cuts.find((c) => t < c.at + c.length) ?? cuts[cuts.length - 1]!

/** Where the capture of `cut` stands at film time `t`, kept off the very last frame. */
export const videoTime = (cut: Cut, t: number, duration: number) =>
  Math.min(
    cut.from + (t - cut.at) * cut.rate,
    (Number.isFinite(duration) && duration > 0 ? duration : 99) - 0.05,
  )

/**
 * Keeps the film's <video> elements on the film clock: the one of the current
 * cut plays (or holds its frame), the others pause. `prepare` runs on every
 * sync, for a video that must wait on a given frame.
 */
export function useVideoSync(
  cuts: readonly Cut[],
  t: number,
  playing: boolean,
  prepare?: (videos: Readonly<Record<string, HTMLVideoElement | null>>, current: Cut) => void,
) {
  const videos = useRef<Record<string, HTMLVideoElement | null>>({})
  const now = useRef({ t, playing })

  const sync = useCallback(() => {
    const { t: time, playing: on } = now.current
    const cut = cutAt(cuts, time)
    for (const [key, el] of Object.entries(videos.current))
      if (key !== cut.video && el && !el.paused) el.pause()
    prepare?.(videos.current, cut)
    const el = videos.current[cut.video]
    if (!el) return
    const target = videoTime(cut, time, el.duration)
    if (!on || Math.abs(el.currentTime - target) > 0.3) {
      try {
        el.currentTime = target
      } catch {
        // not seekable yet: `loadedmetadata` syncs again
      }
    }
    el.playbackRate = cut.rate
    if (on && el.paused) el.play().catch(() => {})
    if (!on && !el.paused) el.pause()
  }, [cuts, prepare])

  useEffect(() => {
    now.current = { t, playing }
    sync()
  }, [sync, t, playing])

  /** A ref callback for the video `key`: muted, and synced once it knows its length. */
  const binders = useRef<Record<string, (el: HTMLVideoElement | null) => void>>({})
  const bind = useCallback(
    (key: string) =>
      (binders.current[key] ??= (el: HTMLVideoElement | null) => {
        videos.current[key] = el
        if (el) el.muted = true
      }),
    [],
  )

  return { bind, onLoaded: sync }
}
