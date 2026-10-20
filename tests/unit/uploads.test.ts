import { describe, expect, it } from 'vitest'

import { isAllowedOctetStream, riveFileFilter, RIVE_TYPES } from '@/domain/uploads'
import { RiveBlock } from '@/blocks/rive'

describe('uploads', () => {
  it('accepts a Rive file as a binary upload', () => {
    expect(isAllowedOctetStream('application/octet-stream', 'luma.riv')).toBe(true)
  })

  it('refuses any other binary', () => {
    expect(isAllowedOctetStream('application/octet-stream', 'tool.exe')).toBe(false)
    expect(isAllowedOctetStream('application/octet-stream', 'luma.riv.exe')).toBe(false)
    expect(isAllowedOctetStream('application/octet-stream', undefined)).toBe(false)
  })

  it('accepts a Rive file typed from its extension, and no other text file', () => {
    expect(isAllowedOctetStream('text/plain', 'luma.riv')).toBe(true)
    expect(isAllowedOctetStream('text/plain', 'notes.txt')).toBe(false)
    expect(isAllowedOctetStream('text/plain', 'page.html')).toBe(false)
  })

  it('leaves the other accepted types to Payload', () => {
    expect(isAllowedOctetStream('image/png', 'photo.png')).toBe(true)
  })
})

describe('the rive block picker', () => {
  it('offers a .riv typed either way, nothing else', () => {
    expect(riveFileFilter).toEqual({
      and: [{ mimeType: { in: [...RIVE_TYPES] } }, { filename: { like: '.riv' } }],
    })
    expect(RIVE_TYPES).toContain('text/plain')
    const file = RiveBlock.fields.find((f) => 'name' in f && f.name === 'file')
    expect(file && 'filterOptions' in file ? file.filterOptions : null).toBe(riveFileFilter)
  })
})
