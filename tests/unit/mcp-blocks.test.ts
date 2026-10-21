import { describe, expect, it } from 'vitest'

import { patchBlock } from '@/domain/mcp-blocks'
import { collectionTools, servedItems, withoutSelect } from '@/mcp/plugin'

const layout = [
  { id: 'a', blockType: 'hero', headline: 'H' },
  {
    id: 'b',
    blockType: 'videoCarousel',
    start: 1,
    labels: { previous: 'Previous', next: 'Next', play: null },
    videos: [{ id: 'v1', platform: 'youtube', videoId: 'x', title: 'X' }],
  },
  { id: 'c', blockType: 'spotify', ref: 'artist:1' },
]

const fieldsOf = (type: string) =>
  ({
    hero: new Set(['headline']),
    section: new Set(['heading', 'body']),
    videoCarousel: new Set(['start', 'labels', 'videos']),
  })[type]

describe('one block of a page', () => {
  it('changes the fields of one block and keeps every other block', () => {
    const patched = patchBlock(layout, 'b', { start: 2, labels: { play: 'Play' } }, fieldsOf)
    expect(patched.ok && patched.layout).toEqual([
      layout[0],
      { ...layout[1], start: 2, labels: { previous: 'Previous', next: 'Next', play: 'Play' } },
      layout[2],
    ])
  })

  it('replaces a list or a rich text as sent', () => {
    const old = { root: { type: 'root', direction: 'ltr', children: [{ type: 'paragraph' }] } }
    const body = { root: { type: 'root', children: [] } }
    const section = [{ id: 's', blockType: 'section', body: old }]
    const patched = patchBlock(section, 's', { body }, fieldsOf)
    expect(patched.ok && patched.layout[0]?.body).toEqual(body)
    const lists = patchBlock(layout, 'b', { videos: [] }, fieldsOf)
    expect(lists.ok && lists.layout[1]?.videos).toEqual([])
  })

  it('refuses an unknown block, an empty change, and a change of id or type', () => {
    expect(patchBlock(layout, 'z', { start: 2 }, fieldsOf).ok).toBe(false)
    expect(patchBlock(layout, 'b', {}, fieldsOf).ok).toBe(false)
    expect(patchBlock(layout, 'b', { blockType: 'hero' }, fieldsOf).ok).toBe(false)
    expect(patchBlock(layout, 'b', { id: 'a' }, fieldsOf).ok).toBe(false)
    expect(patchBlock(null, 'b', { start: 2 }, fieldsOf).ok).toBe(false)
  })

  it('refuses a field the block does not have, which Payload would drop silently', () => {
    const typo = patchBlock(layout, 'a', { headlin: 'X' }, fieldsOf)
    expect(typo).toEqual({ ok: false, error: 'Not a field of a hero block: headlin.' })
    expect(patchBlock(layout, 'c', { ref: 'x' }, fieldsOf).ok).toBe(false)
  })
})

type Item = Parameters<typeof withoutSelect>[0]
const tool = (configKey: string, seen: unknown[], type = 'collectionTool') =>
  ({
    type,
    collectionSlug: 'pages',
    globalSlug: 'site',
    configKey,
    mcpName: configKey,
    tool: {
      handler: async (args: { input: unknown }) => {
        seen.push(args.input)
        return { content: [] }
      },
    },
  }) as unknown as Item

const journal: unknown[] = []
const req = {
  context: {},
  user: null,
  payload: { create: async (args: unknown) => void journal.push(args) },
}
const call = async (item: Item, input: Record<string, unknown>) =>
  (item as unknown as { tool: { handler: (a: unknown) => Promise<unknown> } }).tool.handler({
    input,
    req,
    slug: 'pages',
  })

describe('restoring a version through the MCP server', () => {
  it('never passes `select` on, which would save an empty version', async () => {
    const seen: unknown[] = []
    await call(withoutSelect(tool('restoreVersion', seen)), { id: 21, select: { updatedAt: true } })
    await call(withoutSelect(tool('restoreGlobalVersion', seen, 'globalTool')), {
      id: 3,
      select: { updatedAt: true },
    })
    expect(seen).toEqual([{ id: 21 }, { id: 3 }])
  })

  it('never passes `select` on to updateGlobal, whose version row would lack the name', async () => {
    const seen: unknown[] = []
    await call(withoutSelect(tool('updateGlobal', seen, 'globalTool')), {
      data: { name: 'x' },
      select: { updatedAt: true },
    })
    expect(seen).toEqual([{ data: { name: 'x' } }])
  })

  it('leaves the other tools as they are', async () => {
    const seen: unknown[] = []
    await call(withoutSelect(tool('find', seen)), { select: { title: true } })
    expect(seen).toEqual([{ select: { title: true } }])
  })

  it('serves every item journaled and without `select` on restore', async () => {
    const seen: unknown[] = []
    journal.length = 0
    const [served] = servedItems([tool('restoreVersion', seen)])
    await call(served as Item, { id: 21, select: { updatedAt: true } })
    expect(seen).toEqual([{ id: 21 }])
    expect(journal).toHaveLength(1)
  })
})

describe('the tools of each collection', () => {
  const toolsOf = (slug: string) =>
    (collectionTools as Record<string, { tools: Record<string, unknown> }>)[slug]?.tools
  it('offers the block tool on pages only', () => {
    expect(toolsOf('pages')).toHaveProperty('updateBlock')
    expect(toolsOf('projects')).not.toHaveProperty('updateBlock')
    expect(toolsOf('media')).not.toHaveProperty('updateBlock')
  })
})
