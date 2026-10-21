import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_timeline_entries_tone" AS ENUM('past', 'current', 'highlight');
  CREATE TYPE "public"."enum__pages_v_blocks_timeline_entries_tone" AS ENUM('past', 'current', 'highlight');
  ALTER TABLE "pages_blocks_timeline_entries" ADD COLUMN "tone" "enum_pages_blocks_timeline_entries_tone" DEFAULT 'past';
  ALTER TABLE "pages_blocks_timeline_entries" ADD COLUMN "span" numeric DEFAULT 1;
  ALTER TABLE "_pages_v_blocks_timeline_entries" ADD COLUMN "tone" "enum__pages_v_blocks_timeline_entries_tone" DEFAULT 'past';
  ALTER TABLE "_pages_v_blocks_timeline_entries" ADD COLUMN "span" numeric DEFAULT 1;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_timeline_entries" DROP COLUMN "tone";
  ALTER TABLE "pages_blocks_timeline_entries" DROP COLUMN "span";
  ALTER TABLE "_pages_v_blocks_timeline_entries" DROP COLUMN "tone";
  ALTER TABLE "_pages_v_blocks_timeline_entries" DROP COLUMN "span";
  DROP TYPE "public"."enum_pages_blocks_timeline_entries_tone";
  DROP TYPE "public"."enum__pages_v_blocks_timeline_entries_tone";`)
}
