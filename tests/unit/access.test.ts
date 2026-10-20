import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { adminOnly, publishedOrAdmin, untrashedOrAdmin } from '@/domain/access'

const req = (user: unknown) =>
  ({ req: { user } as PayloadRequest }) as Parameters<typeof adminOnly>[0]
const admin = { id: 1, collection: 'users' }

describe('access', () => {
  it('refuses an anonymous write', () => {
    expect(adminOnly(req(null))).toBe(false)
  })

  it('lets an administrator write', () => {
    expect(adminOnly(req(admin))).toBe(true)
  })

  it('treats a principal of another collection as no administrator', () => {
    expect(adminOnly(req({ id: 1, collection: 'api-keys' }))).toBe(false)
  })

  it('restricts an anonymous read to published, untrashed documents', () => {
    expect(publishedOrAdmin(req(null))).toEqual({
      and: [{ _status: { equals: 'published' } }, { deletedAt: { exists: false } }],
    })
  })

  it('restricts an anonymous media read to untrashed files', () => {
    expect(untrashedOrAdmin(req(null))).toEqual({ deletedAt: { exists: false } })
  })

  it('lets an administrator read drafts and the trash', () => {
    expect(publishedOrAdmin(req(admin))).toBe(true)
    expect(untrashedOrAdmin(req(admin))).toBe(true)
  })
})
