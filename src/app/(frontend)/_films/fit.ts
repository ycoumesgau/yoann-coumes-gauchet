/**
 * How tall a film's stage may be. On a phone (a stage under 600 px wide) the
 * whole film, its controls and caption included, fits in the screen under the
 * site's sticky header, measured on the small viewport (`100svh`, the browser's
 * bars shown). Wider, a film keeps the height it asks for.
 */
export const NARROW = 600

/**
 * A floor, so that no film is squeezed to nothing; shorter than this, a film
 * keeps this much and scrolls. The narrow layouts are checked down to the
 * smallest phone in use: an iPhone SE in Safari, bars shown, leaves a stage of
 * about 275 × 435 px.
 */
export const MIN_STAGE = 360

export const stageHeight = (
  natural: number,
  frame: { width: number; viewport: number; header: number; chrome: number },
): number => {
  if (frame.width >= NARROW || frame.viewport <= 0) return natural
  const room = Math.floor(frame.viewport - frame.header - frame.chrome)
  return Math.min(natural, Math.max(room, MIN_STAGE))
}
