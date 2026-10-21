import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_headline_width" AS ENUM('16', '17', '18');
  CREATE TYPE "public"."enum_pages_blocks_hero_subhead_width" AS ENUM('34', '36', '38');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_headline_width" AS ENUM('16', '17', '18');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_subhead_width" AS ENUM('34', '36', '38');
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "headline_width" "enum_pages_blocks_hero_headline_width";
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "subhead_width" "enum_pages_blocks_hero_subhead_width";
  ALTER TABLE "pages_blocks_work_rows_rows" ADD COLUMN "illustration_id" integer;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "headline_width" "enum__pages_v_blocks_hero_headline_width";
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "subhead_width" "enum__pages_v_blocks_hero_subhead_width";
  ALTER TABLE "_pages_v_blocks_work_rows_rows" ADD COLUMN "illustration_id" integer;
  ALTER TABLE "pages_blocks_work_rows_rows" ADD CONSTRAINT "pages_blocks_work_rows_rows_illustration_id_media_id_fk" FOREIGN KEY ("illustration_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_rows_rows" ADD CONSTRAINT "_pages_v_blocks_work_rows_rows_illustration_id_media_id_fk" FOREIGN KEY ("illustration_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_work_rows_rows_illustration_idx" ON "pages_blocks_work_rows_rows" USING btree ("illustration_id");
  CREATE INDEX "_pages_v_blocks_work_rows_rows_illustration_idx" ON "_pages_v_blocks_work_rows_rows" USING btree ("illustration_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_work_rows_rows" DROP CONSTRAINT "pages_blocks_work_rows_rows_illustration_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_work_rows_rows" DROP CONSTRAINT "_pages_v_blocks_work_rows_rows_illustration_id_media_id_fk";
  
  DROP INDEX "pages_blocks_work_rows_rows_illustration_idx";
  DROP INDEX "_pages_v_blocks_work_rows_rows_illustration_idx";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "headline_width";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "subhead_width";
  ALTER TABLE "pages_blocks_work_rows_rows" DROP COLUMN "illustration_id";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "headline_width";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "subhead_width";
  ALTER TABLE "_pages_v_blocks_work_rows_rows" DROP COLUMN "illustration_id";
  DROP TYPE "public"."enum_pages_blocks_hero_headline_width";
  DROP TYPE "public"."enum_pages_blocks_hero_subhead_width";
  DROP TYPE "public"."enum__pages_v_blocks_hero_headline_width";
  DROP TYPE "public"."enum__pages_v_blocks_hero_subhead_width";`)
}
