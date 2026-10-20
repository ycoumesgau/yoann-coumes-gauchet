import { Forbidden, getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

let payload: Payload
const slug = `test-${Date.now()}`

describe('pages: drafts stay private, per locale', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await payload.create({
      collection: 'pages',
      overrideAccess: true,
      draft: true,
      data: { title: 'Draft only', slug, _status: 'draft' },
    })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
  })

  it('hides a draft from an anonymous reader', async () => {
    const result = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      user: null,
      where: { slug: { equals: slug } },
    })
    expect(result.docs).toHaveLength(0)
  })

  it('shows it once published, in that locale only', async () => {
    await payload.update({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { equals: slug } },
      data: { _status: 'published' },
    })
    const read = (locale: 'en' | 'fr') =>
      payload.find({
        collection: 'pages',
        overrideAccess: false,
        user: null,
        locale,
        where: { slug: { equals: slug } },
      })
    expect((await read('en')).docs[0]?.title).toBe('Draft only')
    // Payload 4 stores `_status` per locale: French stays unpublished until it is published itself.
    expect((await read('fr')).docs).toHaveLength(0)
  })

  it('publishes French on its own, with its own required fields', async () => {
    await payload.update({
      collection: 'pages',
      overrideAccess: true,
      locale: 'fr',
      where: { slug: { equals: slug } },
      data: { title: 'Brouillon seulement', _status: 'published' },
    })
    const result = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      user: null,
      locale: 'fr',
      where: { slug: { equals: slug } },
    })
    expect(result.docs[0]?.title).toBe('Brouillon seulement')
  })

  it('keeps an unpublished edit of a published page private', async () => {
    const [page] = (
      await payload.find({
        collection: 'pages',
        overrideAccess: true,
        where: { slug: { equals: slug } },
      })
    ).docs
    await payload.update({
      collection: 'pages',
      id: page!.id,
      overrideAccess: true,
      draft: true,
      data: { title: 'Unpublished edit' },
    })
    const result = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      user: null,
      draft: true,
      where: { slug: { equals: slug } },
    })
    // The draft read sees nothing (the latest version is a draft)...
    expect(result.docs).toHaveLength(0)
    // ...and the published row was not overwritten by the draft save.
    const published = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      user: null,
      where: { slug: { equals: slug } },
    })
    expect(published.docs.map((doc) => doc.title)).toEqual(['Draft only'])
  })

  it('refuses an anonymous write', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        overrideAccess: false,
        user: null,
        data: { title: 'Intrusion', slug: `${slug}-x` },
      }),
    ).rejects.toThrow(Forbidden)
  })
})
