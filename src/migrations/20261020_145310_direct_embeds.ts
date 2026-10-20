import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_locales" CASCADE;
  DROP TABLE "_site_v_locales" CASCADE;
  ALTER TABLE "pages_blocks_video_carousel_videos" DROP CONSTRAINT "pages_blocks_video_carousel_videos_poster_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_video_carousel_videos" DROP CONSTRAINT "_pages_v_blocks_video_carousel_videos_poster_id_media_id_fk";
  
  DROP INDEX "pages_blocks_video_carousel_videos_poster_idx";
  DROP INDEX "_pages_v_blocks_video_carousel_videos_poster_idx";
  ALTER TABLE "pages_blocks_video_carousel_videos" DROP COLUMN "poster_id";
  ALTER TABLE "_pages_v_blocks_video_carousel_videos" DROP COLUMN "poster_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_locales" (
  	"third_party_notice" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_v_locales" (
  	"version_third_party_notice" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_video_carousel_videos" ADD COLUMN "poster_id" integer;
  ALTER TABLE "_pages_v_blocks_video_carousel_videos" ADD COLUMN "poster_id" integer;
  ALTER TABLE "site_locales" ADD CONSTRAINT "site_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_locales" ADD CONSTRAINT "_site_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "site_locales_parent_id_locale_unique" ON "site_locales" USING btree ("_parent_id","_locale");
  CREATE UNIQUE INDEX "_site_v_locales_parent_id_locale_unique" ON "_site_v_locales" USING btree ("_parent_id","_locale");
  ALTER TABLE "pages_blocks_video_carousel_videos" ADD CONSTRAINT "pages_blocks_video_carousel_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_carousel_videos" ADD CONSTRAINT "_pages_v_blocks_video_carousel_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_video_carousel_videos_poster_idx" ON "pages_blocks_video_carousel_videos" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_video_carousel_videos_poster_idx" ON "_pages_v_blocks_video_carousel_videos" USING btree ("poster_id");`)
}
