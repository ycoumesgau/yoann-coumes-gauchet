/**
 * Closed list of the site's demonstrations. A demo is React code; the CMS only
 * places it on a page and carries its caption and source. One id per demo of
 * `docs/plans/site.md` §4 (D1–D13), in the same order.
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
