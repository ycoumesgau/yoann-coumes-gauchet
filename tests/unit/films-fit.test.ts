import { describe, expect, it } from 'vitest'

import { MIN_STAGE, stageHeight } from '@/app/(frontend)/_films/fit'

// An iPhone 14 in Safari, bars shown: 664 px of small viewport, the site's
// header 65 px, the film's controls and caption 95 px.
const phone = { width: 348, viewport: 664, header: 65, chrome: 95 }

describe('the height of a film on a phone', () => {
  it('fits the whole film in the screen under the header', () => {
    expect(stageHeight(1131, phone)).toBe(664 - 65 - 95)
    expect(stageHeight(1131, phone) + phone.header + phone.chrome).toBeLessThanOrEqual(664)
  })

  it('keeps a film that already fits as it is', () => {
    expect(stageHeight(452, phone)).toBe(452)
  })

  it('leaves a wide film alone, and a film not measured yet', () => {
    expect(stageHeight(780, { ...phone, width: 1100 })).toBe(780)
    expect(stageHeight(780, { ...phone, viewport: 0 })).toBe(780)
  })

  it('never cuts a film below what can still be read', () => {
    expect(stageHeight(900, { ...phone, viewport: 300 })).toBe(MIN_STAGE)
    expect(stageHeight(200, { ...phone, viewport: 300 })).toBe(200)
  })
})
