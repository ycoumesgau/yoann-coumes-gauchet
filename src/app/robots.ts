import type { MetadataRoute } from 'next'

import { robotsRules } from '@/domain/seo'

import { siteOrigin } from './(frontend)/_lib/content'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return robotsRules(siteOrigin())
}
