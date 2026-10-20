import type { Block } from 'payload'

/** A Rive animation (.riv uploaded to media), such as Luma, Licorn's mascot. */
export const RiveBlock: Block = {
  slug: 'rive',
  interfaceName: 'RiveBlock',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'body', type: 'textarea', localized: true },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { equals: 'application/octet-stream' } },
      admin: { description: 'The .riv file. Without it, the still image is shown.' },
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
      filterOptions: { mimeType: { like: 'image/' } },
      admin: {
        description: 'Still image shown when animation is unavailable or motion is reduced.',
      },
    },
  ],
}
