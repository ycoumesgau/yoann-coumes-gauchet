import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findPublishedPage, publishedLocales } from '@/app/(frontend)/_lib/content'
import config from '@/payload.config'

/**
 * What the public pages read in each language: a page published in English
 * only has no French form, never English text under a French URL.
 */
let payload: Payload
let id: number
const slug = `locales-${Date.now()}`

describe('public pages by language', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: true,
      locale: 'en',
      data: {
        title: 'English only',
        slug,
        meta: { description: 'English description' },
        _status: 'published',
      },
    })
    id = page.id
  })

  afterAll(async () => {
    await payload.delete({ collection: 'pages', overrideAccess: true, trash: true, id })
  })

  it('serves the English page and no French one', async () => {
    expect((await findPublishedPage(payload, slug, 'en'))?.title).toBe('English only')
    expect(await findPublishedPage(payload, slug, 'fr')).toBeNull()
    expect(await publishedLocales(payload, slug)).toEqual(['en'])
  })

  it('serves French once French is published, in French', async () => {
    await payload.update({
      collection: 'pages',
      id,
      overrideAccess: true,
      locale: 'fr',
      data: { title: 'Seulement en français', _status: 'published' },
    })
    const french = await findPublishedPage(payload, slug, 'fr')
    expect(french?.title).toBe('Seulement en français')
    // A field left empty in French stays empty: no English sentence on a French page.
    expect(french?.meta?.description ?? null).toBeNull()
    expect(await publishedLocales(payload, slug)).toEqual(['en', 'fr'])
  })

  it('stops serving a language once it is a draft again', async () => {
    await payload.update({
      collection: 'pages',
      id,
      overrideAccess: true,
      locale: 'fr',
      data: { _status: 'draft' },
    })
    expect(await findPublishedPage(payload, slug, 'fr')).toBeNull()
    expect((await findPublishedPage(payload, slug, 'en'))?.title).toBe('English only')
  })
})
