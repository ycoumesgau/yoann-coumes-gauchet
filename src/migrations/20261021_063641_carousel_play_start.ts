import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_video_carousel" ADD COLUMN "labels_play" varchar;
  ALTER TABLE "pages_blocks_video_carousel" ADD COLUMN "start" numeric DEFAULT 1;
  ALTER TABLE "_pages_v_blocks_video_carousel" ADD COLUMN "labels_play" varchar;
  ALTER TABLE "_pages_v_blocks_video_carousel" ADD COLUMN "start" numeric DEFAULT 1;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_video_carousel" DROP COLUMN "labels_play";
  ALTER TABLE "pages_blocks_video_carousel" DROP COLUMN "start";
  ALTER TABLE "_pages_v_blocks_video_carousel" DROP COLUMN "labels_play";
  ALTER TABLE "_pages_v_blocks_video_carousel" DROP COLUMN "start";`)
}
