import * as migration_20261020_121623_initial from './20261020_121623_initial'
import * as migration_20261020_122649_media_embeds from './20261020_122649_media_embeds'

export const migrations = [
  {
    up: migration_20261020_121623_initial.up,
    down: migration_20261020_121623_initial.down,
    name: '20261020_121623_initial',
  },
  {
    up: migration_20261020_122649_media_embeds.up,
    down: migration_20261020_122649_media_embeds.down,
    name: '20261020_122649_media_embeds',
  },
]
