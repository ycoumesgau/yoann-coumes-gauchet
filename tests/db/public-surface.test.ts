import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

/**
 * What an anonymous caller can reach besides the current published version:
 * old versions, trashed documents, a locale that was never published. Each case
 * was open before it was closed (hostile review of the first PR).
 */
let payload: Payload
const slug = `surface-${Date.now()}`
const anonymous = { overrideAccess: false, user: null } as const

const pageId = async (): Promise<number> => {
  const { docs } = await payload.find({
    collection: 'pages',
    overrideAccess: true,
    trash: true,
    where: { slug: { equals: slug } },
  })
  return docs[0]!.id
}

describe('public surface', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await payload.create({
      collection: 'pages',
      overrideAccess: true,
      data: { title: 'First published text', slug, _status: 'published' },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'pages', overrideAccess: true, id: await pageId() })
  })

  it('serves an English-only page in no French form', async () => {
    const id = await pageId()
    const byId = await payload
      .findByID({ collection: 'pages', id, locale: 'fr', fallbackLocale: false, ...anonymous })
      .catch(() => null)
    // Either refused, or without a French title: never a French "published" document.
    expect(byId?.title ?? null).toBeNull()
  })

  it('never serves versions anonymously, even a corrected or unpublished one', async () => {
    const id = await pageId()
    await payload.update({
      collection: 'pages',
      id,
      overrideAccess: true,
      data: { title: 'Corrected text', _status: 'published' },
    })
    await payload.update({
      collection: 'pages',
      id,
      overrideAccess: true,
      data: { _status: 'draft' },
    })
    const versions = await payload
      .findVersions({ collection: 'pages', where: { parent: { equals: id } }, ...anonymous })
      .then((result) => result.docs)
      .catch(() => [])
    expect(versions).toHaveLength(0)
  })

  it('hides a trashed page, even when the caller asks for the trash', async () => {
    const id = await pageId()
    await payload.update({
      collection: 'pages',
      id,
      overrideAccess: true,
      data: { title: 'Trashed text', _status: 'published' },
    })
    const visible = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      ...anonymous,
    })
    expect(visible.docs).toHaveLength(1)

    await payload.update({
      collection: 'pages',
      id,
      overrideAccess: true,
      data: { deletedAt: new Date().toISOString() },
    })
    const trashed = await payload.find({
      collection: 'pages',
      trash: true,
      where: { slug: { equals: slug } },
      ...anonymous,
    })
    expect(trashed.docs).toHaveLength(0)
    const byId = await payload
      .findByID({ collection: 'pages', id, trash: true, ...anonymous })
      .catch(() => null)
    expect(byId).toBeNull()
  })
})
