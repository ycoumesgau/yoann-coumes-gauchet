import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_gallery_items_badge_tone" AS ENUM('past', 'live', 'private');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_items_badge_tone" AS ENUM('past', 'live', 'private');
  ALTER TABLE "pages_blocks_gallery_items" ADD COLUMN "badge_tone" "enum_pages_blocks_gallery_items_badge_tone" DEFAULT 'live';
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD COLUMN "badge_tone" "enum__pages_v_blocks_gallery_items_badge_tone" DEFAULT 'live';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_gallery_items" DROP COLUMN "badge_tone";
  ALTER TABLE "_pages_v_blocks_gallery_items" DROP COLUMN "badge_tone";
  DROP TYPE "public"."enum_pages_blocks_gallery_items_badge_tone";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_items_badge_tone";`)
}
