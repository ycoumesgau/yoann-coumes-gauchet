import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_columns_heading_size" AS ENUM('large', 'small');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_heading_size" AS ENUM('large', 'small');
  ALTER TYPE "public"."enum_pages_blocks_fact_list_columns" ADD VALUE '3' BEFORE '4';
  ALTER TYPE "public"."enum__pages_v_blocks_fact_list_columns" ADD VALUE '3' BEFORE '4';
  ALTER TABLE "pages_blocks_columns" ADD COLUMN "heading_size" "enum_pages_blocks_columns_heading_size" DEFAULT 'large';
  ALTER TABLE "_pages_v_blocks_columns" ADD COLUMN "heading_size" "enum__pages_v_blocks_columns_heading_size" DEFAULT 'large';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "pages_blocks_fact_list" SET "columns" = '2' WHERE "columns" = '3';
  UPDATE "_pages_v_blocks_fact_list" SET "columns" = '2' WHERE "columns" = '3';
  ALTER TABLE "pages_blocks_fact_list" ALTER COLUMN "columns" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_fact_list" ALTER COLUMN "columns" SET DEFAULT '2'::text;
  DROP TYPE "public"."enum_pages_blocks_fact_list_columns";
  CREATE TYPE "public"."enum_pages_blocks_fact_list_columns" AS ENUM('1', '2', '4');
  ALTER TABLE "pages_blocks_fact_list" ALTER COLUMN "columns" SET DEFAULT '2'::"public"."enum_pages_blocks_fact_list_columns";
  ALTER TABLE "pages_blocks_fact_list" ALTER COLUMN "columns" SET DATA TYPE "public"."enum_pages_blocks_fact_list_columns" USING "columns"::"public"."enum_pages_blocks_fact_list_columns";
  ALTER TABLE "_pages_v_blocks_fact_list" ALTER COLUMN "columns" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_fact_list" ALTER COLUMN "columns" SET DEFAULT '2'::text;
  DROP TYPE "public"."enum__pages_v_blocks_fact_list_columns";
  CREATE TYPE "public"."enum__pages_v_blocks_fact_list_columns" AS ENUM('1', '2', '4');
  ALTER TABLE "_pages_v_blocks_fact_list" ALTER COLUMN "columns" SET DEFAULT '2'::"public"."enum__pages_v_blocks_fact_list_columns";
  ALTER TABLE "_pages_v_blocks_fact_list" ALTER COLUMN "columns" SET DATA TYPE "public"."enum__pages_v_blocks_fact_list_columns" USING "columns"::"public"."enum__pages_v_blocks_fact_list_columns";
  ALTER TABLE "pages_blocks_columns" DROP COLUMN "heading_size";
  ALTER TABLE "_pages_v_blocks_columns" DROP COLUMN "heading_size";
  DROP TYPE "public"."enum_pages_blocks_columns_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_columns_heading_size";`)
}
