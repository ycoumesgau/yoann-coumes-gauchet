import { getPayload, type Payload, type PayloadRequest } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { updateBlock } from '@/mcp/plugin'
import type { User } from '@/payload-types'

let payload: Payload
let user: User & { collection: 'users' }

const body = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        textFormat: 0,
        textStyle: '',
        children: [
          { type: 'text', version: 1, text: 'x', format: 0, style: '', mode: 'normal', detail: 0 },
        ],
      },
    ],
  },
} as never

describe('the updateBlock tool', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const created = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email: `blocks-${Date.now()}@example.test`, password: `pw-${Date.now()}-x` },
    })
    user = { ...created, collection: 'users' }
  })

  it('changes one block, in one locale, keeps the others, and publishes only when asked', async () => {
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: false,
      user,
      locale: 'en',
      data: {
        title: 'Blocks',
        slug: `blocks-${Date.now()}`,
        _status: 'published',
        layout: [
          { blockType: 'hero', headline: 'Headline' },
          { blockType: 'section', heading: 'Section', body },
        ],
      },
    })
    try {
      const hero = page.layout?.[0]?.id as string
      const section = page.layout?.[1]?.id as string
      const req = { payload, user: { ...user }, payloadAPI: 'MCP', context: {} } as never
      const run = (input: Record<string, unknown>) =>
        (updateBlock.handler as (a: unknown) => Promise<{ isError?: boolean }>)({
          slug: 'pages',
          input,
          req: req as PayloadRequest,
        })
      const read = (locale: 'en' | 'fr', draft = false) =>
        payload.findByID({
          collection: 'pages',
          id: page.id,
          locale,
          fallbackLocale: false,
          draft,
          depth: 0,
          overrideAccess: true,
        })

      const draft = await run({
        id: page.id,
        locale: 'en',
        blockId: hero,
        fields: { headline: 'Draft' },
      })
      expect(draft.isError).toBeUndefined()
      expect((await read('en')).layout?.[0]).toMatchObject({ headline: 'Headline' })

      // A pending draft edit of another block survives a change of this one.
      await run({ id: page.id, locale: 'en', blockId: section, fields: { heading: 'Pending' } })
      await run({
        id: page.id,
        locale: 'en',
        blockId: hero,
        fields: { headline: 'New' },
        publish: true,
      })
      const published = await read('en')
      expect(published.layout).toHaveLength(2)
      expect(published.layout?.[0]).toMatchObject({ headline: 'New' })
      expect(published.layout?.[1]).toMatchObject({ heading: 'Pending' })

      // French has no blocks yet: the English ones are not read through a fallback.
      const fallback = await run({
        id: page.id,
        locale: 'fr',
        blockId: hero,
        fields: { headline: 'X' },
      })
      expect(fallback.isError).toBe(true)

      await payload.update({
        collection: 'pages',
        id: page.id,
        locale: 'fr',
        draft: true,
        overrideAccess: true,
        data: { title: 'Blocs', layout: [{ blockType: 'hero', headline: 'Titre' }] },
      })
      const frHero = (await read('fr', true)).layout?.[0]?.id as string
      await run({ id: page.id, locale: 'fr', blockId: frHero, fields: { headline: 'Nouveau' } })
      expect((await read('fr', true)).layout?.[0]).toMatchObject({ headline: 'Nouveau' })
      const english = await read('en', true)
      expect(english.layout?.[0]).toMatchObject({ headline: 'New' })
      expect(english.layout).toHaveLength(2)

      const unknown = await run({
        id: page.id,
        locale: 'en',
        blockId: 'nope',
        fields: { headline: 'X' },
      })
      expect(unknown.isError).toBe(true)
      const typo = await run({ id: page.id, locale: 'en', blockId: hero, fields: { headlin: 'X' } })
      expect(typo.isError).toBe(true)
    } finally {
      await payload.delete({ collection: 'pages', id: page.id, overrideAccess: true })
    }
  })
})
