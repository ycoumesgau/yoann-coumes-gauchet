/** Lowercase kebab-case, no leading or trailing dash. `home` is the root page. */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const validateSlug = (value: unknown): true | string => {
  if (typeof value !== 'string' || value.length === 0) return 'A slug is required.'
  if (value.length > 64) return 'A slug is at most 64 characters.'
  if (!slugPattern.test(value)) return 'Use lowercase letters, digits and single dashes.'
  return true
}
