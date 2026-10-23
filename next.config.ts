import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { previewFrameSource } from './src/domain/preview'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // `next dev` would write an AGENTS.md; the rule it carries is in CLAUDE.md §2.
  agentRules: false,
  // No page of the site is meant to be framed, the live preview aside. On the consent
  // screen it matters: a framed "Allow" could be clicked by Yoann for someone else's connector.
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        { key: 'X-Frame-Options', value: 'DENY' },
      ],
    },
    {
      // The live preview, framed by `/admin` on this origin only. Last, so it wins.
      source: previewFrameSource,
      headers: [
        { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    },
  ],
  images: {
    // Next keeps a resized image 4 hours by default, past the moment its media goes to the
    // trash; five minutes bounds how long a trashed image stays reachable (ADR-3).
    minimumCacheTTL: 300,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
