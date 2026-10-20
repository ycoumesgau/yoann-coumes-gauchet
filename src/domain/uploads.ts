/**
 * Media are public: an upload is something the site may serve to anyone. A
 * Rive animation has no MIME type of its own and arrives as
 * `application/octet-stream`; that type is accepted for `.riv` files only, so
 * the media library cannot host an arbitrary binary.
 */
export const OCTET_STREAM = 'application/octet-stream'

export const isAllowedOctetStream = (mimeType: unknown, filename: unknown): boolean =>
  mimeType !== OCTET_STREAM || (typeof filename === 'string' && /^[^/\\]+\.riv$/i.test(filename))
