import { getPayload } from 'payload'

import config from '@/payload.config'

// Temporary renderer until the front-end batch (L3): it only proves that the
// public site reads published content through Payload's access control.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'pages',
    overrideAccess: false,
    user: null,
    where: { slug: { equals: 'home' } },
    limit: 1,
  })
  const page = docs[0]

  return (
    <main>
      <h1>{page?.title ?? 'Yoann Coumes-Gauchet'}</h1>
    </main>
  )
}
