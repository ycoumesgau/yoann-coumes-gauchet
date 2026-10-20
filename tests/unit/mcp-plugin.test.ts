import { describe, expect, it } from 'vitest'

import { isExposedItem } from '@/mcp/plugin'

type Item = Parameters<typeof isExposedItem>[0]
const collectionTool = (collectionSlug: string, configKey: string) =>
  ({ type: 'collectionTool', collectionSlug, configKey }) as unknown as Item

describe('MCP exposure', () => {
  it('exposes the content, without the built-in delete', () => {
    expect(isExposedItem(collectionTool('pages', 'update'))).toBe(true)
    expect(isExposedItem(collectionTool('media', 'requestPermanentDeletion'))).toBe(true)
    expect(isExposedItem(collectionTool('pages', 'delete'))).toBe(false)
  })

  it('shows deletion requests read only', () => {
    expect(isExposedItem(collectionTool('deletion-requests', 'find'))).toBe(true)
    expect(isExposedItem(collectionTool('deletion-requests', 'update'))).toBe(false)
  })

  it('hides accounts, OAuth records, the journal and Payload collections', () => {
    for (const slug of [
      'users',
      'mcp-authorizations',
      'mcp-authorization-codes',
      'mcp-events',
      'payload-preferences',
    ]) {
      expect(isExposedItem(collectionTool(slug, 'find'))).toBe(false)
    }
  })
})
