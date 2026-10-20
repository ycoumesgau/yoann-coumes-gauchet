import { describe, expect, it } from 'vitest'

import { mediaStorageConfig } from '@/domain/media-storage'

const full = {
  S3_BUCKET: 'media',
  S3_ENDPOINT: 'https://ref.storage.supabase.co/storage/v1/s3/',
  S3_REGION: 'eu-west-3',
  S3_ACCESS_KEY_ID: 'id',
  S3_SECRET_ACCESS_KEY: 'secret',
}

describe('mediaStorageConfig', () => {
  it('turns storage on with all five variables', () => {
    expect(mediaStorageConfig(full)).toMatchObject({
      enabled: true,
      bucket: 'media',
      endpoint: 'https://ref.storage.supabase.co/storage/v1/s3',
    })
  })

  it('stays off, and says what is missing, on a partial set', () => {
    expect(mediaStorageConfig({ ...full, S3_SECRET_ACCESS_KEY: ' ' })).toEqual({
      enabled: false,
      missing: ['S3_SECRET_ACCESS_KEY'],
    })
    expect(mediaStorageConfig({})).toMatchObject({ enabled: false })
  })

  it('never sends credentials in clear', () => {
    expect(mediaStorageConfig({ ...full, S3_ENDPOINT: 'http://ref.example/s3' }).enabled).toBe(
      false,
    )
    expect(mediaStorageConfig({ ...full, S3_ENDPOINT: 'not a url' }).enabled).toBe(false)
  })
})
