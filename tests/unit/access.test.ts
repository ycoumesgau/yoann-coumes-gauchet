import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { adminOnly, publishedOrAdmin } from '@/domain/access'

const req = (user: unknown) =>
  ({ req: { user } as PayloadRequest }) as Parameters<typeof adminOnly>[0]

describe('access', () => {
  it('refuses an anonymous write', () => {
    expect(adminOnly(req(null))).toBe(false)
  })

  it('lets an administrator write', () => {
    expect(adminOnly(req({ id: 1, collection: 'users' }))).toBe(true)
  })

  it('restricts an anonymous read to published documents', () => {
    expect(publishedOrAdmin(req(null))).toEqual({ _status: { equals: 'published' } })
  })

  it('lets an administrator read drafts', () => {
    expect(publishedOrAdmin(req({ id: 1, collection: 'users' }))).toBe(true)
  })
})
