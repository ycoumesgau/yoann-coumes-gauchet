import { describe, expect, it } from 'vitest'

import { validateSlug } from '@/domain/slug'

describe('validateSlug', () => {
  it.each(['home', 'nexcan', 'recipe2video', 'a-b-c'])('accepts %s', (slug) => {
    expect(validateSlug(slug)).toBe(true)
  })

  it.each(['', 'Home', '-a', 'a-', 'a--b', 'a b', 'é', 'a/b', 'x'.repeat(65)])(
    'refuses %j',
    (slug) => {
      expect(validateSlug(slug)).not.toBe(true)
    },
  )

  it('refuses a non-string', () => {
    expect(validateSlug(undefined)).not.toBe(true)
  })
})
