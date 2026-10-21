import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_columns_columns_card" AS ENUM('none', 'plain', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_columns_card" AS ENUM('none', 'plain', 'accent');
  ALTER TABLE "pages_blocks_columns_columns" ADD COLUMN "card" "enum_pages_blocks_columns_columns_card" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_columns_columns" ADD COLUMN "card" "enum__pages_v_blocks_columns_columns_card" DEFAULT 'none';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_columns_columns" DROP COLUMN "card";
  ALTER TABLE "_pages_v_blocks_columns_columns" DROP COLUMN "card";
  DROP TYPE "public"."enum_pages_blocks_columns_columns_card";
  DROP TYPE "public"."enum__pages_v_blocks_columns_columns_card";`)
}
