import { describe, expect, it } from 'vitest'

import {
  isAllowedOctetStream,
  PASTE_URL_ALLOW_LIST,
  riveFileFilter,
  RIVE_TYPES,
} from '@/domain/uploads'
import { isURLAllowed } from 'payload/internal'

import { RiveBlock } from '@/blocks/rive'
import { Media } from '@/collections/Media'

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

describe('server-side fetch of media', () => {
  it("the allow-list matches this site's own import folder only (Payload's isURLAllowed)", () => {
    const allow = (url: string) => isURLAllowed(url, PASTE_URL_ALLOW_LIST)
    expect(allow('https://yoann-coumes-gauchet.vercel.app/import/luma.riv')).toBe(true)
    expect(allow('http://yoann-coumes-gauchet.vercel.app/import/luma.riv')).toBe(false)
    expect(allow('https://yoann-coumes-gauchet.vercel.app/admin/x')).toBe(false)
    expect(allow('https://yoann-coumes-gauchet.vercel.app/import/a/b.webp')).toBe(false)
    expect(allow('https://evil.example/import/luma.riv')).toBe(false)
    expect(allow('https://yoann-coumes-gauchet.vercel.app.evil.example/import/x')).toBe(false)
    const upload = Media.upload
    expect(typeof upload === 'object' && upload.pasteURL).toEqual({
      allowList: PASTE_URL_ALLOW_LIST,
    })
  })
})
