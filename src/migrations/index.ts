import * as migration_20261020_121623_initial from './20261020_121623_initial'
import * as migration_20261020_122649_media_embeds from './20261020_122649_media_embeds'
import * as migration_20261020_124336_mcp_oauth from './20261020_124336_mcp_oauth'
import * as migration_20261020_130412_mcp_review from './20261020_130412_mcp_review'
import * as migration_20261020_142120_third_party_notice from './20261020_142120_third_party_notice'
import * as migration_20261020_143717_media_storage_fields from './20261020_143717_media_storage_fields'
import * as migration_20261020_145310_direct_embeds from './20261020_145310_direct_embeds'

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
  {
    up: migration_20261020_124336_mcp_oauth.up,
    down: migration_20261020_124336_mcp_oauth.down,
    name: '20261020_124336_mcp_oauth',
  },
  {
    up: migration_20261020_130412_mcp_review.up,
    down: migration_20261020_130412_mcp_review.down,
    name: '20261020_130412_mcp_review',
  },
  {
    up: migration_20261020_142120_third_party_notice.up,
    down: migration_20261020_142120_third_party_notice.down,
    name: '20261020_142120_third_party_notice',
  },
  {
    up: migration_20261020_143717_media_storage_fields.up,
    down: migration_20261020_143717_media_storage_fields.down,
    name: '20261020_143717_media_storage_fields',
  },
  {
    up: migration_20261020_145310_direct_embeds.up,
    down: migration_20261020_145310_direct_embeds.down,
    name: '20261020_145310_direct_embeds',
  },
]
