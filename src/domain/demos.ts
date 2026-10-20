/**
 * Closed list of the site's demonstrations. A demo is React code; the CMS only
 * places it on a page and carries its caption and source. Ids follow
 * `docs/plans/site.md` (D1–D13).
 */
export const demoKeys = [
  'paper-to-deliverable',
  'nexcan-case',
  'photo-bench',
  'screening-toy',
  'luma-video',
  'recipe-ingestion',
  'recipe2video-validation',
  'recipe2video-videos',
  'build-log',
  'hostile-review',
  'background-video',
  'ask-this-site',
  'accounting-agent',
] as const

export type DemoKey = (typeof demoKeys)[number]
