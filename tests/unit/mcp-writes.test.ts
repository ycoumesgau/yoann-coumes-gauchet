import { describe, expect, it } from 'vitest'

import nextConfig from '../../next.config'
import { mcpWriteIsDraft } from '@/domain/mcp-writes'

describe('MCP writes land as drafts (ADR-2 §3)', () => {
  it('turns a plain edit into a draft', () => {
    expect(mcpWriteIsDraft({ data: { title: 'Typo fixed' } })).toBe(true)
    expect(mcpWriteIsDraft({ data: { title: 'Typo fixed' }, draft: false })).toBe(true)
  })

  it('keeps an explicit change of status', () => {
    expect(mcpWriteIsDraft({ data: { title: 'New', _status: 'published' } })).toBe(false)
    expect(mcpWriteIsDraft({ data: { _status: 'draft' } })).toBe(false)
    expect(mcpWriteIsDraft({ data: { title: 'New' }, publishAllLocales: true })).toBe(false)
    expect(mcpWriteIsDraft({ data: {}, unpublishAllLocales: true })).toBe(false)
  })

  it('keeps a move to or from the trash, and only that', () => {
    expect(mcpWriteIsDraft({ data: { deletedAt: '2026-10-20T12:00:00Z' } })).toBe(false)
    expect(mcpWriteIsDraft({ data: { deletedAt: null } })).toBe(false)
    expect(mcpWriteIsDraft({ data: { deletedAt: null, title: 'Sneaked in' } })).toBe(true)
  })
})

describe('framing', () => {
  it('forbids every page, the consent screen included, from being framed', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const all = rules.find((rule) => rule.source === '/:path*')
    expect(all?.headers).toEqual(
      expect.arrayContaining([
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        { key: 'X-Frame-Options', value: 'DENY' },
      ]),
    )
  })
})
