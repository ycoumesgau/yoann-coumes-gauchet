/**
 * Luma, Licorn's mascot, as its Rive file drives it. Pure: names, codes and the
 * timing of what the component plays (`src/app/(frontend)/_blocks/luma.tsx`).
 *
 * The contract is Licorn's own (`monorepo/packages/mascot`): the file plays the
 * `LumaFace` state machine and is driven by data binding, through the four
 * properties of its view model `ViewModel1` (bound with `autoBind`), not through
 * state machine inputs.
 */

/** `packages/mascot/src/luma-controller.ts:20`. */
export const LUMA_STATE_MACHINE = 'LumaFace'

/** `packages/mascot/src/luma-controller.ts:26-31`: exact names, as in the file. */
export const LUMA_PROPERTIES = {
  emotion: 'emotion',
  isSpeaking: 'is_speaking',
  viseme: 'viseme',
  blink: 'blink',
} as const

/** The Rive runtime's `wasm`, served by the site rather than from a public CDN. */
export const RIVE_RUNTIME_VERSION = '2.38.3'
export const RIVE_WASM_URL = `/rive/rive-${RIVE_RUNTIME_VERSION}.wasm`

/** The state machine a block names, or Luma's own when it names none. */
export const resolveStateMachine = (name: string | null | undefined): string =>
  name?.trim() || LUMA_STATE_MACHINE

/** Emotion codes, `packages/mascot/src/emotions.ts:6-16` (0 to 8). */
export const Emotion = {
  neutral: 0,
  focused: 1,
  surprised: 2,
  satisfied: 3,
  hungry: 4,
  comicFail: 5,
  emotional: 6,
  shy: 7,
  faceless: 8,
} as const
export type EmotionCode = (typeof Emotion)[keyof typeof Emotion]

/** What a hover or a touch shows, in turn: every face but the resting one and the blank one. */
export const HOVER_EMOTIONS: readonly EmotionCode[] = [
  Emotion.surprised,
  Emotion.satisfied,
  Emotion.hungry,
  Emotion.shy,
  Emotion.comicFail,
  Emotion.emotional,
  Emotion.focused,
]

/** The face shown on the `count`-th hover (0 first), cycling through `HOVER_EMOTIONS`. */
export const hoverEmotion = (count: number): EmotionCode => {
  const length = HOVER_EMOTIONS.length
  const index = ((Math.trunc(count) % length) + length) % length
  return HOVER_EMOTIONS[Number.isFinite(index) ? index : 0] ?? Emotion.surprised
}

/** Visemes, `packages/mascot/src/visemes.ts:29-45` (1 to 15; 1 is silence). */
export const Viseme = {
  sil: 1,
  PP: 2,
  FF: 3,
  TH: 4,
  DD: 5,
  kk: 6,
  CH: 7,
  SS: 8,
  nn: 9,
  RR: 10,
  aa: 11,
  E: 12,
  I: 13,
  O: 14,
  U: 15,
} as const
export type VisemeCode = (typeof Viseme)[keyof typeof Viseme]

const consonants: readonly [VisemeCode, ...VisemeCode[]] = [
  Viseme.PP,
  Viseme.FF,
  Viseme.TH,
  Viseme.DD,
  Viseme.kk,
  Viseme.CH,
  Viseme.SS,
  Viseme.nn,
  Viseme.RR,
]
const vowels: readonly [VisemeCode, ...VisemeCode[]] = [
  Viseme.aa,
  Viseme.E,
  Viseme.I,
  Viseme.O,
  Viseme.U,
]

/** How long Luma "talks" after a click, without sound. */
export const TALK_MS = 3200
/** How long a face shown by a touch stays (a finger has no "leave"). */
export const TOUCH_EMOTION_MS = 2000

export type MouthFrame = { viseme: VisemeCode; ms: number }

/** A random source in [0, 1), injected so the pattern can be tested. */
export type Random = () => number

const between = (random: Random, min: number, max: number): number =>
  Math.round(min + Math.min(Math.max(random(), 0), 0.999) * (max - min))
const pick = <T>(random: Random, items: readonly [T, ...T[]]): T =>
  items[Math.min(Math.floor(Math.max(random(), 0) * items.length), items.length - 1)] ?? items[0]

/**
 * A synthetic mouth pattern standing in for speech: syllables (a consonant,
 * then a longer vowel) grouped in words of two to four, a short silence between
 * words, and silence at the end. No audio: only the shape of talking.
 */
export const talkingFrames = (durationMs: number, random: Random): MouthFrame[] => {
  const frames: MouthFrame[] = []
  let elapsed = 0
  const push = (viseme: VisemeCode, ms: number) => {
    frames.push({ viseme, ms })
    elapsed += ms
  }
  while (elapsed < durationMs) {
    const syllables = between(random, 2, 4)
    for (let i = 0; i < syllables && elapsed < durationMs; i += 1) {
      push(pick(random, consonants), between(random, 60, 100))
      push(pick(random, vowels), between(random, 110, 180))
    }
    if (elapsed < durationMs) push(Viseme.sil, between(random, 80, 160))
  }
  if (frames.at(-1)?.viseme !== Viseme.sil) push(Viseme.sil, 0)
  return frames
}

/** The wait before the next blink at rest: between 2.5 and 5.5 seconds. */
export const nextBlinkDelay = (random: Random): number => between(random, 2500, 5500)

/** The handles of the four properties, any of which may be missing (then a no-op). */
export type LumaHandles = {
  emotion: { value: number } | null
  isSpeaking: { value: boolean } | null
  viseme: { value: number } | null
  blink: { trigger: () => void } | null
}

/** What the runtime's bound view model instance offers, as far as Luma needs it. */
export type ViewModelInstanceLike = {
  number(path: string): { value: number } | null
  boolean(path: string): { value: boolean } | null
  trigger(path: string): { trigger: () => void } | null
}

/** Finds Luma's four properties on the bound instance; none when nothing is bound. */
export const resolveLumaHandles = (instance: ViewModelInstanceLike | null): LumaHandles => ({
  emotion: instance?.number(LUMA_PROPERTIES.emotion) ?? null,
  isSpeaking: instance?.boolean(LUMA_PROPERTIES.isSpeaking) ?? null,
  viseme: instance?.number(LUMA_PROPERTIES.viseme) ?? null,
  blink: instance?.trigger(LUMA_PROPERTIES.blink) ?? null,
})

/**
 * Drives Luma through her handles, like Licorn's `LumaController`
 * (`packages/mascot/src/luma-controller.ts:64-105`): a missing property is a no-op.
 */
export const lumaDriver = (handles: LumaHandles | null) => ({
  setEmotion(code: EmotionCode): void {
    if (handles?.emotion) handles.emotion.value = code
  },
  setViseme(code: VisemeCode): void {
    if (handles?.viseme) handles.viseme.value = code
  },
  setSpeaking(speaking: boolean): void {
    if (handles?.isSpeaking) handles.isSpeaking.value = speaking
  },
  blink(): void {
    handles?.blink?.trigger()
  },
  /** Talking needs both the mouth switch and the viseme. */
  canTalk(): boolean {
    return Boolean(handles?.isSpeaking && handles.viseme)
  },
})
