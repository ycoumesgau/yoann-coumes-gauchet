import * as migration_20261020_121623_initial from './20261020_121623_initial'

export const migrations = [
  {
    up: migration_20261020_121623_initial.up,
    down: migration_20261020_121623_initial.down,
    name: '20261020_121623_initial',
  },
]
