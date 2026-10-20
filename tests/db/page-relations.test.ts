import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findPublishedPage } from '@/app/(frontend)/_lib/content'
import config from '@/payload.config'

/**
 * What a page's project cards receive from Payload, as the public site reads
 * them: a project published in the requested language, with its own page;
 * a project not published there, as a bare id the renderer leaves out.
 */
let payload: Payload
const stamp = Date.now()
const ids: { pages: number[]; projects: number[] } = { pages: [], projects: [] }

describe('relations on a public page', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const target = await payload.create({
      collection: 'pages',
      overrideAccess: true,
      locale: 'en',
      data: { title: 'Target', slug: `target-${stamp}`, _status: 'published' },
    })
    ids.pages.push(target.id)
    const project = await payload.create({
      collection: 'projects',
      overrideAccess: true,
      locale: 'en',
      data: {
        name: 'Project',
        slug: `project-${stamp}`,
        tagline: 'Tagline',
        period: 'Period',
        summary: 'Summary',
        page: target.id,
        _status: 'published',
      } as never,
    })
    ids.projects.push(project.id)
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: true,
      locale: 'en',
      data: {
        title: 'Cards',
        slug: `cards-${stamp}`,
        layout: [{ blockType: 'projectCards', projects: [project.id] }],
        _status: 'published',
      },
    })
    ids.pages.push(page.id)
    await payload.update({
      collection: 'pages',
      id: page.id,
      overrideAccess: true,
      locale: 'fr',
      // The layout is per language: French has its own block, citing the same project.
      data: {
        title: 'Cartes',
        layout: [{ blockType: 'projectCards', projects: [project.id] }],
        _status: 'published',
      },
    })
  })

  afterAll(async () => {
    for (const id of ids.projects) {
      await payload.delete({ collection: 'projects', overrideAccess: true, trash: true, id })
    }
    for (const id of ids.pages) {
      await payload.delete({ collection: 'pages', overrideAccess: true, trash: true, id })
    }
  })

  const cards = async (locale: 'en' | 'fr') => {
    const page = await findPublishedPage(payload, `cards-${stamp}`, locale, 2)
    const block = page?.layout?.[0]
    return block?.blockType === 'projectCards' ? block.projects : []
  }

  it('populates a published project and its own page at the rendering depth', async () => {
    const [project] = await cards('en')
    expect(typeof project).toBe('object')
    expect(typeof project === 'object' && typeof project?.page === 'object').toBe(true)
  })

  it('gives a project not published in this language as a bare id', async () => {
    expect(await cards('fr')).toEqual([ids.projects[0]])
  })
})
