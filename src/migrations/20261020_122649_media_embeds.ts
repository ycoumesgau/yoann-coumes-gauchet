import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_video_carousel_videos_platform" AS ENUM('youtube', 'tiktok', 'instagram');
  CREATE TYPE "public"."enum__pages_v_blocks_video_carousel_videos_platform" AS ENUM('youtube', 'tiktok', 'instagram');
  CREATE TABLE "pages_blocks_video_carousel_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_pages_blocks_video_carousel_videos_platform" DEFAULT 'youtube',
  	"video_id" varchar,
  	"title" varchar,
  	"poster_id" integer
  );
  
  CREATE TABLE "pages_blocks_video_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_spotify" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"ref" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"state_machine" varchar,
  	"caption" varchar,
  	"fallback_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_carousel_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__pages_v_blocks_video_carousel_videos_platform" DEFAULT 'youtube',
  	"video_id" varchar,
  	"title" varchar,
  	"poster_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_spotify" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"ref" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"state_machine" varchar,
  	"caption" varchar,
  	"fallback_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_video_carousel_videos" ADD CONSTRAINT "pages_blocks_video_carousel_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_carousel_videos" ADD CONSTRAINT "pages_blocks_video_carousel_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_video_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_carousel" ADD CONSTRAINT "pages_blocks_video_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spotify" ADD CONSTRAINT "pages_blocks_spotify_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rive" ADD CONSTRAINT "pages_blocks_rive_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_rive" ADD CONSTRAINT "pages_blocks_rive_fallback_id_media_id_fk" FOREIGN KEY ("fallback_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_rive" ADD CONSTRAINT "pages_blocks_rive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_carousel_videos" ADD CONSTRAINT "_pages_v_blocks_video_carousel_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_carousel_videos" ADD CONSTRAINT "_pages_v_blocks_video_carousel_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_video_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_carousel" ADD CONSTRAINT "_pages_v_blocks_video_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spotify" ADD CONSTRAINT "_pages_v_blocks_spotify_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rive" ADD CONSTRAINT "_pages_v_blocks_rive_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rive" ADD CONSTRAINT "_pages_v_blocks_rive_fallback_id_media_id_fk" FOREIGN KEY ("fallback_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rive" ADD CONSTRAINT "_pages_v_blocks_rive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_video_carousel_videos_order_idx" ON "pages_blocks_video_carousel_videos" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_carousel_videos_parent_id_idx" ON "pages_blocks_video_carousel_videos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_carousel_videos_locale_idx" ON "pages_blocks_video_carousel_videos" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_carousel_videos_poster_idx" ON "pages_blocks_video_carousel_videos" USING btree ("poster_id");
  CREATE INDEX "pages_blocks_video_carousel_order_idx" ON "pages_blocks_video_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_carousel_parent_id_idx" ON "pages_blocks_video_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_carousel_path_idx" ON "pages_blocks_video_carousel" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_carousel_locale_idx" ON "pages_blocks_video_carousel" USING btree ("_locale");
  CREATE INDEX "pages_blocks_spotify_order_idx" ON "pages_blocks_spotify" USING btree ("_order");
  CREATE INDEX "pages_blocks_spotify_parent_id_idx" ON "pages_blocks_spotify" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spotify_path_idx" ON "pages_blocks_spotify" USING btree ("_path");
  CREATE INDEX "pages_blocks_spotify_locale_idx" ON "pages_blocks_spotify" USING btree ("_locale");
  CREATE INDEX "pages_blocks_rive_order_idx" ON "pages_blocks_rive" USING btree ("_order");
  CREATE INDEX "pages_blocks_rive_parent_id_idx" ON "pages_blocks_rive" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rive_path_idx" ON "pages_blocks_rive" USING btree ("_path");
  CREATE INDEX "pages_blocks_rive_locale_idx" ON "pages_blocks_rive" USING btree ("_locale");
  CREATE INDEX "pages_blocks_rive_file_idx" ON "pages_blocks_rive" USING btree ("file_id");
  CREATE INDEX "pages_blocks_rive_fallback_idx" ON "pages_blocks_rive" USING btree ("fallback_id");
  CREATE INDEX "_pages_v_blocks_video_carousel_videos_order_idx" ON "_pages_v_blocks_video_carousel_videos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_carousel_videos_parent_id_idx" ON "_pages_v_blocks_video_carousel_videos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_carousel_videos_locale_idx" ON "_pages_v_blocks_video_carousel_videos" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_video_carousel_videos_poster_idx" ON "_pages_v_blocks_video_carousel_videos" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_video_carousel_order_idx" ON "_pages_v_blocks_video_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_carousel_parent_id_idx" ON "_pages_v_blocks_video_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_carousel_path_idx" ON "_pages_v_blocks_video_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_carousel_locale_idx" ON "_pages_v_blocks_video_carousel" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_spotify_order_idx" ON "_pages_v_blocks_spotify" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spotify_parent_id_idx" ON "_pages_v_blocks_spotify" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_spotify_path_idx" ON "_pages_v_blocks_spotify" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_spotify_locale_idx" ON "_pages_v_blocks_spotify" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_rive_order_idx" ON "_pages_v_blocks_rive" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rive_parent_id_idx" ON "_pages_v_blocks_rive" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rive_path_idx" ON "_pages_v_blocks_rive" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rive_locale_idx" ON "_pages_v_blocks_rive" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_rive_file_idx" ON "_pages_v_blocks_rive" USING btree ("file_id");
  CREATE INDEX "_pages_v_blocks_rive_fallback_idx" ON "_pages_v_blocks_rive" USING btree ("fallback_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_video_carousel_videos" CASCADE;
  DROP TABLE "pages_blocks_video_carousel" CASCADE;
  DROP TABLE "pages_blocks_spotify" CASCADE;
  DROP TABLE "pages_blocks_rive" CASCADE;
  DROP TABLE "_pages_v_blocks_video_carousel_videos" CASCADE;
  DROP TABLE "_pages_v_blocks_video_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_spotify" CASCADE;
  DROP TABLE "_pages_v_blocks_rive" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_video_carousel_videos_platform";
  DROP TYPE "public"."enum__pages_v_blocks_video_carousel_videos_platform";`)
}
