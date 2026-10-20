/**
 * Where uploaded media live (ADR-3): Supabase Storage through its S3 API in
 * production, the local disk in development and CI. All five variables or
 * none: a partial set leaves storage off rather than guessing, and the
 * configuration names the unusable variables in the production logs.
 */

export const mediaStorageVariables = [
  'S3_BUCKET',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
] as const

export type MediaStorageConfig =
  | {
      readonly enabled: true
      readonly bucket: string
      readonly endpoint: string
      readonly region: string
      readonly accessKeyId: string
      readonly secretAccessKey: string
    }
  | { readonly enabled: false; readonly unusable: readonly string[] }

export const mediaStorageConfig = (
  env: Readonly<Record<string, string | undefined>>,
): MediaStorageConfig => {
  const value = (name: (typeof mediaStorageVariables)[number]) => env[name]?.trim() ?? ''
  const missing = mediaStorageVariables.filter((name) => value(name) === '')
  if (missing.length > 0) return { enabled: false, unusable: missing }
  let endpoint: URL
  try {
    endpoint = new URL(value('S3_ENDPOINT'))
  } catch {
    return { enabled: false, unusable: ['S3_ENDPOINT'] }
  }
  // Credentials never travel in clear.
  if (endpoint.protocol !== 'https:') return { enabled: false, unusable: ['S3_ENDPOINT'] }
  return {
    enabled: true,
    bucket: value('S3_BUCKET'),
    endpoint: endpoint.toString().replace(/\/$/, ''),
    region: value('S3_REGION'),
    accessKeyId: value('S3_ACCESS_KEY_ID'),
    secretAccessKey: value('S3_SECRET_ACCESS_KEY'),
  }
}
