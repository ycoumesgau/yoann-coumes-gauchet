import { getPayload, type Payload } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

/**
 * The S3 adapter adds `prefix` and `_objectKey` to `media` whether or not its
 * variables are set. Without the adapter registered, or without the migration
 * that creates the columns, turning storage on in production would make every
 * media read fail ("column does not exist").
 */
let payload: Payload

describe('media schema with or without S3', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('declares the storage fields even with storage off', () => {
    const names = payload.collections.media.config.flattenedFields.map((field) => field.name)
    expect(names).toEqual(expect.arrayContaining(['prefix', '_objectKey']))
  })

  it('has their columns in the migrated database', async () => {
    const result = await payload.db.drizzle.execute(
      sql`select column_name from information_schema.columns where table_name = 'media'`,
    )
    const columns = result.rows.map((row) => row.column_name)
    expect(columns).toEqual(expect.arrayContaining(['prefix', '_objectkey']))
  })
})
