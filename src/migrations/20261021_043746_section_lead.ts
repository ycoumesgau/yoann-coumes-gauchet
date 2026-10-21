import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_section" ADD COLUMN "lead" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "lead" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_section" DROP COLUMN "lead";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "lead";`)
}
