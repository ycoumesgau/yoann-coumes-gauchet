import * as migration_20261020_121623_initial from './20261020_121623_initial'
import * as migration_20261020_122649_media_embeds from './20261020_122649_media_embeds'
import * as migration_20261020_124336_mcp_oauth from './20261020_124336_mcp_oauth'
import * as migration_20261020_130412_mcp_review from './20261020_130412_mcp_review'
import * as migration_20261020_142120_third_party_notice from './20261020_142120_third_party_notice'
import * as migration_20261020_143717_media_storage_fields from './20261020_143717_media_storage_fields'
import * as migration_20261020_145310_direct_embeds from './20261020_145310_direct_embeds'
import * as migration_20261020_212418_site_v2_blocks from './20261020_212418_site_v2_blocks'
import * as migration_20261021_040203_seo_plugin from './20261021_040203_seo_plugin'
import * as migration_20261021_043746_section_lead from './20261021_043746_section_lead'
import * as migration_20261021_045844_hero_measures_work_illustration from './20261021_045844_hero_measures_work_illustration'
import * as migration_20261021_052418_gallery_badge_tone from './20261021_052418_gallery_badge_tone'
import * as migration_20261021_054325_fact_columns_three_column_heading_size from './20261021_054325_fact_columns_three_column_heading_size'
import * as migration_20261021_060441_timeline_tone_span from './20261021_060441_timeline_tone_span'
import * as migration_20261021_061710_columns_card from './20261021_061710_columns_card'
import * as migration_20261021_063641_carousel_play_start from './20261021_063641_carousel_play_start'

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
  {
    up: migration_20261020_212418_site_v2_blocks.up,
    down: migration_20261020_212418_site_v2_blocks.down,
    name: '20261020_212418_site_v2_blocks',
  },
  {
    up: migration_20261021_040203_seo_plugin.up,
    down: migration_20261021_040203_seo_plugin.down,
    name: '20261021_040203_seo_plugin',
  },
  {
    up: migration_20261021_043746_section_lead.up,
    down: migration_20261021_043746_section_lead.down,
    name: '20261021_043746_section_lead',
  },
  {
    up: migration_20261021_045844_hero_measures_work_illustration.up,
    down: migration_20261021_045844_hero_measures_work_illustration.down,
    name: '20261021_045844_hero_measures_work_illustration',
  },
  {
    up: migration_20261021_052418_gallery_badge_tone.up,
    down: migration_20261021_052418_gallery_badge_tone.down,
    name: '20261021_052418_gallery_badge_tone',
  },
  {
    up: migration_20261021_054325_fact_columns_three_column_heading_size.up,
    down: migration_20261021_054325_fact_columns_three_column_heading_size.down,
    name: '20261021_054325_fact_columns_three_column_heading_size',
  },
  {
    up: migration_20261021_060441_timeline_tone_span.up,
    down: migration_20261021_060441_timeline_tone_span.down,
    name: '20261021_060441_timeline_tone_span',
  },
  {
    up: migration_20261021_061710_columns_card.up,
    down: migration_20261021_061710_columns_card.down,
    name: '20261021_061710_columns_card',
  },
  {
    up: migration_20261021_063641_carousel_play_start.up,
    down: migration_20261021_063641_carousel_play_start.down,
    name: '20261021_063641_carousel_play_start',
  },
]
