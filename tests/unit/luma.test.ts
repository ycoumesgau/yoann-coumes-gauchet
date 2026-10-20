import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  Emotion,
  HOVER_EMOTIONS,
  LUMA_PROPERTIES,
  LUMA_STATE_MACHINE,
  RIVE_RUNTIME_VERSION,
  RIVE_WASM_URL,
  TALK_MS,
  Viseme,
  hoverEmotion,
  lumaDriver,
  nextBlinkDelay,
  resolveLumaHandles,
  resolveStateMachine,
  talkingFrames,
  type ViewModelInstanceLike,
} from '@/domain/luma'

const root = path.resolve(__dirname, '../..')

/** A seeded source (mulberry32), so a pattern is the same on every run. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

describe('Luma state machine', () => {
  it("plays the block's state machine, or Luma's own when it names none", () => {
    expect(LUMA_STATE_MACHINE).toBe('LumaFace')
    expect(resolveStateMachine('Other')).toBe('Other')
    expect(resolveStateMachine(' LumaFace ')).toBe('LumaFace')
    for (const empty of [null, undefined, '', '   ']) {
      expect(resolveStateMachine(empty)).toBe('LumaFace')
    }
  })

  it('names in the .riv file the state machine, view model and its four properties', () => {
    const riv = readFileSync(path.join(root, 'public/import/luma.riv')).toString('latin1')
    for (const name of [LUMA_STATE_MACHINE, 'ViewModel1', ...Object.values(LUMA_PROPERTIES)]) {
      expect(riv, name).toContain(name)
    }
  })
})

describe('Luma properties', () => {
  const instance = (names: string[]) => {
    const values: Record<string, number | boolean> = {}
    const triggered: string[] = []
    const has = (name: string) => names.includes(name)
    const vmi: ViewModelInstanceLike = {
      number: (name) =>
        has(name)
          ? {
              get value() {
                return values[name] as number
              },
              set value(v) {
                values[name] = v
              },
            }
          : null,
      boolean: (name) =>
        has(name)
          ? {
              get value() {
                return values[name] as boolean
              },
              set value(v) {
                values[name] = v
              },
            }
          : null,
      trigger: (name) => (has(name) ? { trigger: () => triggered.push(name) } : null),
    }
    return { vmi, values, triggered }
  }

  it('resolves the four properties by their exact names and drives them', () => {
    const { vmi, values, triggered } = instance(['emotion', 'is_speaking', 'viseme', 'blink'])
    const luma = lumaDriver(resolveLumaHandles(vmi))
    expect(luma.canTalk()).toBe(true)
    luma.setEmotion(Emotion.hungry)
    luma.setSpeaking(true)
    luma.setViseme(Viseme.aa)
    luma.blink()
    expect(values).toEqual({ emotion: 4, is_speaking: true, viseme: 11 })
    expect(triggered).toEqual(['blink'])
  })

  it('does nothing, and cannot talk, when a property or the binding is missing', () => {
    const { vmi, values } = instance(['emotion', 'is_speaking'])
    const luma = lumaDriver(resolveLumaHandles(vmi))
    expect(luma.canTalk()).toBe(false)
    luma.setViseme(Viseme.O)
    luma.blink()
    expect(values).toEqual({})

    const unbound = lumaDriver(resolveLumaHandles(null))
    expect(unbound.canTalk()).toBe(false)
    expect(() => {
      unbound.setEmotion(Emotion.shy)
      unbound.setSpeaking(true)
      unbound.blink()
    }).not.toThrow()
  })
})

describe('Luma faces', () => {
  it('cycles through every face but the resting and the blank one', () => {
    expect(HOVER_EMOTIONS).not.toContain(Emotion.neutral)
    expect(HOVER_EMOTIONS).not.toContain(Emotion.faceless)
    const seen = Array.from({ length: HOVER_EMOTIONS.length }, (_, i) => hoverEmotion(i))
    expect(new Set(seen).size).toBe(HOVER_EMOTIONS.length)
    expect(hoverEmotion(HOVER_EMOTIONS.length)).toBe(hoverEmotion(0))
    expect(hoverEmotion(-1)).toBe(HOVER_EMOTIONS.at(-1))
    expect(hoverEmotion(Number.NaN)).toBe(HOVER_EMOTIONS[0])
  })

  it('blinks every 2.5 to 5.5 seconds', () => {
    expect(nextBlinkDelay(() => 0)).toBe(2500)
    expect(nextBlinkDelay(() => 0.9999)).toBeLessThanOrEqual(5500)
    const random = seeded(7)
    for (let i = 0; i < 200; i += 1) {
      const delay = nextBlinkDelay(random)
      expect(delay).toBeGreaterThanOrEqual(2500)
      expect(delay).toBeLessThanOrEqual(5500)
    }
  })
})

describe('Luma talking, without sound', () => {
  it.each([1, 2, 3, 42])('fills the talk with syllables and ends in silence (seed %i)', (seed) => {
    const frames = talkingFrames(TALK_MS, seeded(seed))
    const total = frames.reduce((sum, frame) => sum + frame.ms, 0)
    expect(total).toBeGreaterThanOrEqual(TALK_MS)
    expect(total).toBeLessThan(TALK_MS + 400)
    expect(frames.at(-1)?.viseme).toBe(Viseme.sil)
    for (const frame of frames) {
      expect(frame.viseme).toBeGreaterThanOrEqual(1)
      expect(frame.viseme).toBeLessThanOrEqual(15)
      expect(Number.isInteger(frame.ms)).toBe(true)
    }
    // A mouth that moves: open vowels, closed consonants, and pauses between words.
    const vowels = new Set<number>([Viseme.aa, Viseme.E, Viseme.I, Viseme.O, Viseme.U])
    expect(frames.filter((f) => vowels.has(f.viseme)).length).toBeGreaterThan(8)
    expect(frames.filter((f) => f.viseme === Viseme.sil).length).toBeGreaterThan(2)
    // Every consonant opens onto a vowel.
    frames.forEach((frame, i) => {
      if (frame.viseme !== Viseme.sil && !vowels.has(frame.viseme)) {
        expect(vowels.has(frames[i + 1]?.viseme ?? 0), `frame ${i}`).toBe(true)
      }
    })
  })

  it('stays in range with a degenerate random source', () => {
    for (const value of [0, 1, -1, 2]) {
      const frames = talkingFrames(1000, () => value)
      expect(frames.length).toBeGreaterThan(0)
      for (const frame of frames) expect(Object.values(Viseme)).toContain(frame.viseme)
    }
  })
})

describe('Rive runtime', () => {
  it('serves the wasm of the installed runtime from the site', () => {
    // `@rive-app/canvas` is a dependency of the React runtime, resolved from it.
    const fromSite = createRequire(path.join(root, 'package.json'))
    const fromReact = createRequire(fromSite.resolve('@rive-app/react-canvas'))
    const canvasDir = path.dirname(fromReact.resolve('@rive-app/canvas/package.json'))
    const installed = JSON.parse(readFileSync(path.join(canvasDir, 'package.json'), 'utf8')) as {
      version: string
    }
    expect(installed.version).toBe(RIVE_RUNTIME_VERSION)
    const sha = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')
    expect(sha(path.join(root, 'public', RIVE_WASM_URL))).toBe(
      sha(path.join(canvasDir, 'rive.wasm')),
    )
  })
})
