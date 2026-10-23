import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findPreviewPage, findPublishedPage, readPreviewPage } from '@/app/(frontend)/_lib/content'
import config from '@/payload.config'

/**
 * What the live preview reads: the latest draft, for an administrator only,
 * in the language asked and no other; the public pages keep the published text.
 */
let payload: Payload
let id: number
let adminId: number
let adminToken: string
const slug = `preview-${Date.now()}`
const admin = { id: 1, collection: 'users' } as const
const other = { id: 1, collection: 'api-keys' } as const

describe('live preview', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const email = `preview-${Date.now()}@example.com`
    const password = 'preview-test-password'
    adminId = (
      await payload.create({ collection: 'users', overrideAccess: true, data: { email, password } })
    ).id
    adminToken = (await payload.login({ collection: 'users', data: { email, password } })).token!
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: true,
      locale: 'en',
      data: { title: 'Published title', slug, _status: 'published' },
    })
    id = page.id
    await payload.update({
      collection: 'pages',
      id,
      overrideAccess: true,
      locale: 'en',
      draft: true,
      data: { title: 'Draft title' },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'pages', overrideAccess: true, trash: true, id })
    await payload.delete({ collection: 'users', overrideAccess: true, id: adminId })
  })

  it('shows the administrator the draft, and the public the published page', async () => {
    const asAdmin = await findPreviewPage(payload, slug, 'en', admin as never)
    expect(asAdmin?.title).toBe('Draft title')
    expect((await findPublishedPage(payload, slug, 'en'))?.title).toBe('Published title')
  })

  it('never shows a draft to a principal that is not an administrator', async () => {
    const asOther = await findPreviewPage(payload, slug, 'en', other as never)
    // Not even the published text: a draft read past access is refused whole.
    expect(asOther).toBeNull()
  })

  it('serves the route nothing for a visitor, the draft for a signed-in administrator', async () => {
    expect(await readPreviewPage(payload, new Headers(), slug, 'en')).toBeNull()
    const forged = new Headers({ Authorization: 'JWT not-a-token' })
    expect(await readPreviewPage(payload, forged, slug, 'en')).toBeNull()
    const signedIn = new Headers({ Authorization: `JWT ${adminToken}` })
    expect((await readPreviewPage(payload, signedIn, slug, 'en'))?.title).toBe('Draft title')
  })

  it('never fills a language from another one', async () => {
    const french = await findPreviewPage(payload, slug, 'fr', admin as never)
    expect(french?.title ?? null).toBeNull()
  })
})
