/**
 * Media are public: an upload is something the site may serve to anyone. A
 * Rive animation has no MIME type of its own: it arrives as
 * `application/octet-stream`, or, when Payload finds no signature in the bytes
 * and falls back on the extension, as `text/plain`. Those two types are
 * accepted for `.riv` files only, so the media library cannot host an
 * arbitrary binary or text file.
 */
export const OCTET_STREAM = 'application/octet-stream'
export const RIVE_TYPES = [OCTET_STREAM, 'text/plain'] as const

/** What the rive block may pick in media: a `.riv`, typed either way. */
export const riveFileFilter = {
  and: [{ mimeType: { in: [...RIVE_TYPES] } }, { filename: { like: '.riv' } }],
}

export const isAllowedOctetStream = (mimeType: unknown, filename: unknown): boolean =>
  !(RIVE_TYPES as readonly unknown[]).includes(mimeType) ||
  (typeof filename === 'string' && /^[^/\\]+\.riv$/i.test(filename))
