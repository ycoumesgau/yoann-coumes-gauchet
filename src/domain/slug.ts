import { previewSegment } from './preview'

/** Lowercase kebab-case, no leading or trailing dash. `home` is the root page. */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const validateSlug = (value: unknown): true | string => {
  if (typeof value !== 'string' || value.length === 0) return 'A slug is required.'
  if (value.length > 64) return 'A slug is at most 64 characters.'
  if (!slugPattern.test(value)) return 'Use lowercase letters, digits and single dashes.'
  // `/<locale>/preview/<slug>` is the live preview: a page there would be shadowed.
  if (value === previewSegment) return `\`${previewSegment}\` is reserved for the live preview.`
  return true
}
