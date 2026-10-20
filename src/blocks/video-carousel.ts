import type { Block } from 'payload'

import { validateVideoId, videoPlatforms } from '@/domain/embeds'

/** Vertical (9:16) videos published on social networks, shown as a carousel. */
export const VideoCarouselBlock: Block = {
  slug: 'videoCarousel',
  interfaceName: 'VideoCarouselBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'videos',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          defaultValue: 'youtube',
          options: videoPlatforms.map((value) => ({ label: value, value })),
        },
        {
          name: 'videoId',
          type: 'text',
          required: true,
          validate: (value: unknown, { siblingData }: { siblingData: { platform?: unknown } }) =>
            validateVideoId(siblingData.platform, value),
          admin: { description: 'The id only, not the URL (YouTube: 11 characters).' },
        },
        { name: 'title', type: 'text', required: true, localized: true },
      ],
    },
  ],
}
