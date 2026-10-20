import type { Block } from 'payload'

/** A Rive animation (.riv uploaded to media), such as Luma, Licorn's mascot. */
export const RiveBlock: Block = {
  slug: 'rive',
  interfaceName: 'RiveBlock',
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { equals: 'application/octet-stream' } },
    },
    {
      name: 'stateMachine',
      type: 'text',
      admin: { description: 'State machine to play, if any.' },
    },
    { name: 'caption', type: 'textarea', localized: true },
    {
      name: 'fallback',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Still image shown when animation is unavailable or motion is reduced.',
      },
    },
  ],
}
