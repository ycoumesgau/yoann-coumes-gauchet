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
      name: 'labels',
      type: 'group',
      admin: { description: 'The carousel’s own controls.' },
      fields: [
        { name: 'previous', type: 'text', localized: true },
        { name: 'next', type: 'text', localized: true },
        { name: 'autoplay', type: 'text', localized: true },
        {
          name: 'play',
          type: 'text',
          localized: true,
          admin: {
            description: 'Read out before the title on the play button, as in “Play Saint-Honoré”.',
          },
        },
      ],
    },
    {
      name: 'start',
      type: 'number',
      defaultValue: 1,
      min: 1,
      admin: { description: 'The video shown first, by its place in the list (1 = the first).' },
    },
    {
      name: 'links',
      type: 'array',
      admin: { description: 'The channels, under the player.' },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
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
