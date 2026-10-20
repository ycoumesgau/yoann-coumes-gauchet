'use client'

import { Alignment, Fit, Layout, RuntimeLoader, useRive } from '@rive-app/react-canvas'
import { useCallback, useEffect, useRef } from 'react'

import {
  Emotion,
  RIVE_WASM_URL,
  TALK_MS,
  TOUCH_EMOTION_MS,
  Viseme,
  hoverEmotion,
  lumaDriver,
  nextBlinkDelay,
  resolveLumaHandles,
  talkingFrames,
  type EmotionCode,
} from '@/domain/luma'

// The runtime comes from the site, never from unpkg or jsdelivr (its defaults):
// no visitor request leaves for a third party. Without the fallback build, a
// browser that cannot run it keeps the still image.
RuntimeLoader.setWasmUrl(RIVE_WASM_URL)
RuntimeLoader.setWasmFallbackUrl(null)

/**
 * The live layer of `Luma`, over its still. Loaded only in a browser that
 * allows motion (`next/dynamic`, no server render), so the Rive runtime never
 * weighs on a page that shows the still.
 */
export default function LumaCanvas({
  src,
  stateMachine,
  label,
  ready,
  onReady,
  onFail,
}: {
  src: string
  stateMachine: string
  label: string
  /** Whether the canvas has drawn and the still has given way to it. */
  ready: boolean
  /** True once the canvas has drawn; false again when this layer goes away. */
  onReady: (ready: boolean) => void
  onFail: () => void
}) {
  const luma = useRef(lumaDriver(null))
  const timers = useRef<{ talk: number[]; face?: number }>({ talk: [] })
  const hovers = useRef(0)

  const { RiveComponent } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
    onRiveReady: (rive) => {
      luma.current = lumaDriver(resolveLumaHandles(rive.viewModelInstance))
      // One frame later, so the canvas has drawn before the still gives way.
      requestAnimationFrame(() => onReady(true))
    },
    onLoadError: onFail,
  })

  // At rest, she blinks, at a varying pace.
  useEffect(() => {
    if (!ready) return
    let id = 0
    const schedule = () => {
      id = window.setTimeout(() => {
        luma.current.blink()
        schedule()
      }, nextBlinkDelay(Math.random))
    }
    schedule()
    return () => window.clearTimeout(id)
  }, [ready])

  const setEmotion = useCallback((code: EmotionCode) => luma.current.setEmotion(code), [])

  const express = useCallback(() => {
    window.clearTimeout(timers.current.face)
    setEmotion(hoverEmotion(hovers.current))
    hovers.current += 1
  }, [setEmotion])

  const rest = useCallback(() => {
    window.clearTimeout(timers.current.face)
    setEmotion(Emotion.neutral)
  }, [setEmotion])

  const stopTalking = useCallback(() => {
    for (const id of timers.current.talk) window.clearTimeout(id)
    timers.current.talk = []
    luma.current.setViseme(Viseme.sil)
    luma.current.setSpeaking(false)
  }, [])

  const talk = useCallback(() => {
    const current = luma.current
    if (!current.canTalk()) return
    stopTalking()
    current.setSpeaking(true)
    let at = 0
    for (const frame of talkingFrames(TALK_MS, Math.random)) {
      timers.current.talk.push(window.setTimeout(() => current.setViseme(frame.viseme), at))
      at += frame.ms
    }
    timers.current.talk.push(window.setTimeout(stopTalking, at))
  }, [stopTalking])

  const readyRef = useRef(onReady)
  useEffect(() => {
    readyRef.current = onReady
  }, [onReady])
  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const id of pending.talk) window.clearTimeout(id)
      window.clearTimeout(pending.face)
      // Back to the still: when motion is allowed again, it waits for a new first frame.
      readyRef.current(false)
    }
  }, [])

  return (
    <div
      role={ready ? 'button' : undefined}
      tabIndex={ready ? 0 : undefined}
      aria-label={ready ? label : undefined}
      aria-hidden={ready ? undefined : true}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: ready ? 'pointer' : undefined,
        opacity: ready ? 1 : 0,
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') express()
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') rest()
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== 'touch') return
        express()
        timers.current.face = window.setTimeout(rest, TOUCH_EMOTION_MS)
      }}
      onFocus={(event) => {
        // A keyboard visitor gets the face a pointer gets on hover.
        if (event.currentTarget.matches(':focus-visible')) express()
      }}
      onBlur={rest}
      onClick={talk}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        talk()
      }}
    >
      <RiveComponent />
    </div>
  )
}
