import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_section_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_section_demo" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  CREATE TYPE "public"."enum_pages_blocks_features_items_demo" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  CREATE TYPE "public"."enum_pages_blocks_work_rows_rows_tone" AS ENUM('past', 'live', 'private');
  CREATE TYPE "public"."enum_pages_blocks_fact_list_columns" AS ENUM('1', '2', '4');
  CREATE TYPE "public"."enum_pages_blocks_gallery_variant" AS ENUM('screens', 'cards', 'wide');
  CREATE TYPE "public"."enum_pages_blocks_callout_tone" AS ENUM('plain', 'accent', 'note');
  CREATE TYPE "public"."enum__pages_v_blocks_section_image_side" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_section_demo" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  CREATE TYPE "public"."enum__pages_v_blocks_features_items_demo" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  CREATE TYPE "public"."enum__pages_v_blocks_work_rows_rows_tone" AS ENUM('past', 'live', 'private');
  CREATE TYPE "public"."enum__pages_v_blocks_fact_list_columns" AS ENUM('1', '2', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_gallery_variant" AS ENUM('screens', 'cards', 'wide');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_tone" AS ENUM('plain', 'accent', 'note');
  CREATE TYPE "public"."enum_site_film_texts_film" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  CREATE TYPE "public"."enum__site_v_version_film_texts_film" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  CREATE TABLE "pages_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lead" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"demo" "enum_pages_blocks_features_items_demo",
  	"tag" varchar,
  	"link_label" varchar,
  	"link_page_id" integer,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_work_rows_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" varchar,
  	"tone" "enum_pages_blocks_work_rows_rows_tone" DEFAULT 'past',
  	"title" varchar,
  	"meta" varchar,
  	"body" varchar,
  	"link_label" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"image_id" integer,
  	"tag" varchar,
  	"image_caption" varchar
  );
  
  CREATE TABLE "pages_blocks_work_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_fact_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"lead" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages_blocks_fact_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"numbered" boolean DEFAULT false,
  	"columns" "enum_pages_blocks_fact_list_columns" DEFAULT '2',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note_kicker" varchar,
  	"note_title" varchar,
  	"note_body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"caption" varchar,
  	"tag" varchar,
  	"badge" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"source" varchar,
  	"variant" "enum_pages_blocks_gallery_variant" DEFAULT 'screens',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "pages_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tone" "enum_pages_blocks_callout_tone" DEFAULT 'plain',
  	"heading" varchar,
  	"body" varchar,
  	"link_label" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_link_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"title" varchar,
  	"body" varchar,
  	"url" varchar,
  	"url_label" varchar
  );
  
  CREATE TABLE "pages_blocks_link_list_files_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"file_id" integer,
  	"lang" varchar
  );
  
  CREATE TABLE "pages_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"files_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_next_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"link_label" varchar,
  	"link_page_id" integer,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_next_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_carousel_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"demo" "enum__pages_v_blocks_features_items_demo",
  	"tag" varchar,
  	"link_label" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_work_rows_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" varchar,
  	"tone" "enum__pages_v_blocks_work_rows_rows_tone" DEFAULT 'past',
  	"title" varchar,
  	"meta" varchar,
  	"body" varchar,
  	"link_label" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"image_id" integer,
  	"tag" varchar,
  	"image_caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_work_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_fact_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"lead" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_fact_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"numbered" boolean DEFAULT false,
  	"columns" "enum__pages_v_blocks_fact_list_columns" DEFAULT '2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_checklist_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note_kicker" varchar,
  	"note_title" varchar,
  	"note_body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"caption" varchar,
  	"tag" varchar,
  	"badge" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"source" varchar,
  	"variant" "enum__pages_v_blocks_gallery_variant" DEFAULT 'screens',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tone" "enum__pages_v_blocks_callout_tone" DEFAULT 'plain',
  	"heading" varchar,
  	"body" varchar,
  	"link_label" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"title" varchar,
  	"body" varchar,
  	"url" varchar,
  	"url_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_list_files_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"file_id" integer,
  	"lang" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_link_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"files_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_next_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"link_label" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_next_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_carousel_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "site_film_texts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"film" "enum_site_film_texts_film" NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "site_film_texts_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_locales" (
  	"labels_menu" varchar,
  	"labels_close_menu" varchar,
  	"labels_dark" varchar,
  	"labels_light" varchar,
  	"labels_view_larger" varchar,
  	"labels_close" varchar,
  	"labels_previous" varchar,
  	"labels_next" varchar,
  	"labels_play" varchar,
  	"labels_replay" varchar,
  	"labels_pause" varchar,
  	"labels_restart" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_v_version_film_texts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"film" "enum__site_v_version_film_texts_film" NOT NULL,
  	"key" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_v_version_film_texts_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_v_locales" (
  	"version_labels_menu" varchar,
  	"version_labels_close_menu" varchar,
  	"version_labels_dark" varchar,
  	"version_labels_light" varchar,
  	"version_labels_view_larger" varchar,
  	"version_labels_close" varchar,
  	"version_labels_previous" varchar,
  	"version_labels_next" varchar,
  	"version_labels_play" varchar,
  	"version_labels_replay" varchar,
  	"version_labels_pause" varchar,
  	"version_labels_restart" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "demo" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_hero_demo";
  CREATE TYPE "public"."enum_pages_blocks_hero_demo" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "demo" SET DATA TYPE "public"."enum_pages_blocks_hero_demo" USING "demo"::"public"."enum_pages_blocks_hero_demo";
  ALTER TABLE "pages_blocks_demo" ALTER COLUMN "demo" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_demo_demo";
  CREATE TYPE "public"."enum_pages_blocks_demo_demo" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  ALTER TABLE "pages_blocks_demo" ALTER COLUMN "demo" SET DATA TYPE "public"."enum_pages_blocks_demo_demo" USING "demo"::"public"."enum_pages_blocks_demo_demo";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "demo" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_hero_demo";
  CREATE TYPE "public"."enum__pages_v_blocks_hero_demo" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "demo" SET DATA TYPE "public"."enum__pages_v_blocks_hero_demo" USING "demo"::"public"."enum__pages_v_blocks_hero_demo";
  ALTER TABLE "_pages_v_blocks_demo" ALTER COLUMN "demo" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_demo_demo";
  CREATE TYPE "public"."enum__pages_v_blocks_demo_demo" AS ENUM('wsb-funding', 'nexcan-inventory', 'nexcan-screening', 'nexcan-photos', 'recipe2video-checks', 'hostile-review', 'accounting-agent');
  ALTER TABLE "_pages_v_blocks_demo" ALTER COLUMN "demo" SET DATA TYPE "public"."enum__pages_v_blocks_demo_demo" USING "demo"::"public"."enum__pages_v_blocks_demo_demo";
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "status" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "image_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "badge_id" integer;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "number" varchar;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "image_id" integer;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "tag" varchar;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "image_caption" varchar;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "image_side" "enum_pages_blocks_section_image_side" DEFAULT 'right';
  ALTER TABLE "pages_blocks_section" ADD COLUMN "demo" "enum_pages_blocks_section_demo";
  ALTER TABLE "pages_blocks_section" ADD COLUMN "demo_caption" varchar;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "details_label" varchar;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "details" jsonb;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "link_page_id" integer;
  ALTER TABLE "pages_blocks_section" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_demo" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_timeline_entries" ADD COLUMN "page_id" integer;
  ALTER TABLE "pages_blocks_timeline" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_video_carousel" ADD COLUMN "labels_previous" varchar;
  ALTER TABLE "pages_blocks_video_carousel" ADD COLUMN "labels_next" varchar;
  ALTER TABLE "pages_blocks_video_carousel" ADD COLUMN "labels_autoplay" varchar;
  ALTER TABLE "pages_blocks_spotify" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_rive" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_rive" ADD COLUMN "body" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "status" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "image_id" integer;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "badge_id" integer;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "number" varchar;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "image_id" integer;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "tag" varchar;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "image_caption" varchar;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "image_side" "enum__pages_v_blocks_section_image_side" DEFAULT 'right';
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "demo" "enum__pages_v_blocks_section_demo";
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "demo_caption" varchar;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "details_label" varchar;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "details" jsonb;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "link_page_id" integer;
  ALTER TABLE "_pages_v_blocks_section" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_demo" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_timeline_entries" ADD COLUMN "page_id" integer;
  ALTER TABLE "_pages_v_blocks_timeline" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_video_carousel" ADD COLUMN "labels_previous" varchar;
  ALTER TABLE "_pages_v_blocks_video_carousel" ADD COLUMN "labels_next" varchar;
  ALTER TABLE "_pages_v_blocks_video_carousel" ADD COLUMN "labels_autoplay" varchar;
  ALTER TABLE "_pages_v_blocks_spotify" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_rive" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_rive" ADD COLUMN "body" varchar;
  ALTER TABLE "pages_blocks_features_items" ADD CONSTRAINT "pages_blocks_features_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_features_items" ADD CONSTRAINT "pages_blocks_features_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_features_items" ADD CONSTRAINT "pages_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_features" ADD CONSTRAINT "pages_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_rows_rows" ADD CONSTRAINT "pages_blocks_work_rows_rows_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_rows_rows" ADD CONSTRAINT "pages_blocks_work_rows_rows_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_rows_rows" ADD CONSTRAINT "pages_blocks_work_rows_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_work_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_rows" ADD CONSTRAINT "pages_blocks_work_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_fact_list_items" ADD CONSTRAINT "pages_blocks_fact_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_fact_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_fact_list" ADD CONSTRAINT "pages_blocks_fact_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_checklist_items" ADD CONSTRAINT "pages_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_checklist" ADD CONSTRAINT "pages_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_items" ADD CONSTRAINT "pages_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_columns_columns" ADD CONSTRAINT "pages_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_columns" ADD CONSTRAINT "pages_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_list_items" ADD CONSTRAINT "pages_blocks_link_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_list_files_items" ADD CONSTRAINT "pages_blocks_link_list_files_items_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_list_files_items" ADD CONSTRAINT "pages_blocks_link_list_files_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_link_list" ADD CONSTRAINT "pages_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_next_links_links" ADD CONSTRAINT "pages_blocks_next_links_links_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_next_links_links" ADD CONSTRAINT "pages_blocks_next_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_next_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_next_links" ADD CONSTRAINT "pages_blocks_next_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_carousel_links" ADD CONSTRAINT "pages_blocks_video_carousel_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_video_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_items" ADD CONSTRAINT "_pages_v_blocks_features_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_items" ADD CONSTRAINT "_pages_v_blocks_features_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features_items" ADD CONSTRAINT "_pages_v_blocks_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_features" ADD CONSTRAINT "_pages_v_blocks_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_rows_rows" ADD CONSTRAINT "_pages_v_blocks_work_rows_rows_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_rows_rows" ADD CONSTRAINT "_pages_v_blocks_work_rows_rows_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_rows_rows" ADD CONSTRAINT "_pages_v_blocks_work_rows_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_work_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_rows" ADD CONSTRAINT "_pages_v_blocks_work_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_fact_list_items" ADD CONSTRAINT "_pages_v_blocks_fact_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_fact_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_fact_list" ADD CONSTRAINT "_pages_v_blocks_fact_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_checklist_items" ADD CONSTRAINT "_pages_v_blocks_checklist_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_checklist" ADD CONSTRAINT "_pages_v_blocks_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_items" ADD CONSTRAINT "_pages_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_columns_columns" ADD CONSTRAINT "_pages_v_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_columns" ADD CONSTRAINT "_pages_v_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list_items" ADD CONSTRAINT "_pages_v_blocks_link_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list_files_items" ADD CONSTRAINT "_pages_v_blocks_link_list_files_items_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list_files_items" ADD CONSTRAINT "_pages_v_blocks_link_list_files_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_link_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_link_list" ADD CONSTRAINT "_pages_v_blocks_link_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_next_links_links" ADD CONSTRAINT "_pages_v_blocks_next_links_links_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_next_links_links" ADD CONSTRAINT "_pages_v_blocks_next_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_next_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_next_links" ADD CONSTRAINT "_pages_v_blocks_next_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_carousel_links" ADD CONSTRAINT "_pages_v_blocks_video_carousel_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_video_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_film_texts" ADD CONSTRAINT "site_film_texts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_film_texts_locales" ADD CONSTRAINT "site_film_texts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_film_texts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_locales" ADD CONSTRAINT "site_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_version_film_texts" ADD CONSTRAINT "_site_v_version_film_texts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_version_film_texts_locales" ADD CONSTRAINT "_site_v_version_film_texts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v_version_film_texts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v_locales" ADD CONSTRAINT "_site_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_features_items_order_idx" ON "pages_blocks_features_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_items_parent_id_idx" ON "pages_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_items_locale_idx" ON "pages_blocks_features_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_features_items_image_idx" ON "pages_blocks_features_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_features_items_link_link_page_idx" ON "pages_blocks_features_items" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_features_order_idx" ON "pages_blocks_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_features_parent_id_idx" ON "pages_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_features_path_idx" ON "pages_blocks_features" USING btree ("_path");
  CREATE INDEX "pages_blocks_features_locale_idx" ON "pages_blocks_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_work_rows_rows_order_idx" ON "pages_blocks_work_rows_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_work_rows_rows_parent_id_idx" ON "pages_blocks_work_rows_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_work_rows_rows_locale_idx" ON "pages_blocks_work_rows_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_work_rows_rows_link_link_page_idx" ON "pages_blocks_work_rows_rows" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_work_rows_rows_image_idx" ON "pages_blocks_work_rows_rows" USING btree ("image_id");
  CREATE INDEX "pages_blocks_work_rows_order_idx" ON "pages_blocks_work_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_work_rows_parent_id_idx" ON "pages_blocks_work_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_work_rows_path_idx" ON "pages_blocks_work_rows" USING btree ("_path");
  CREATE INDEX "pages_blocks_work_rows_locale_idx" ON "pages_blocks_work_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_fact_list_items_order_idx" ON "pages_blocks_fact_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_fact_list_items_parent_id_idx" ON "pages_blocks_fact_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_fact_list_items_locale_idx" ON "pages_blocks_fact_list_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_fact_list_order_idx" ON "pages_blocks_fact_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_fact_list_parent_id_idx" ON "pages_blocks_fact_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_fact_list_path_idx" ON "pages_blocks_fact_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_fact_list_locale_idx" ON "pages_blocks_fact_list" USING btree ("_locale");
  CREATE INDEX "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_items_locale_idx" ON "pages_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_locale_idx" ON "pages_blocks_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_checklist_items_order_idx" ON "pages_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_checklist_items_parent_id_idx" ON "pages_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_checklist_items_locale_idx" ON "pages_blocks_checklist_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_checklist_order_idx" ON "pages_blocks_checklist" USING btree ("_order");
  CREATE INDEX "pages_blocks_checklist_parent_id_idx" ON "pages_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_checklist_path_idx" ON "pages_blocks_checklist" USING btree ("_path");
  CREATE INDEX "pages_blocks_checklist_locale_idx" ON "pages_blocks_checklist" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_items_order_idx" ON "pages_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_items_parent_id_idx" ON "pages_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_items_locale_idx" ON "pages_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_items_image_idx" ON "pages_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_locale_idx" ON "pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "pages_blocks_columns_columns_order_idx" ON "pages_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_columns_columns_parent_id_idx" ON "pages_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_columns_columns_locale_idx" ON "pages_blocks_columns_columns" USING btree ("_locale");
  CREATE INDEX "pages_blocks_columns_order_idx" ON "pages_blocks_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_columns_parent_id_idx" ON "pages_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_columns_path_idx" ON "pages_blocks_columns" USING btree ("_path");
  CREATE INDEX "pages_blocks_columns_locale_idx" ON "pages_blocks_columns" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_locale_idx" ON "pages_blocks_callout" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_link_link_page_idx" ON "pages_blocks_callout" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_link_list_items_order_idx" ON "pages_blocks_link_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_link_list_items_parent_id_idx" ON "pages_blocks_link_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_link_list_items_locale_idx" ON "pages_blocks_link_list_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_link_list_files_items_order_idx" ON "pages_blocks_link_list_files_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_link_list_files_items_parent_id_idx" ON "pages_blocks_link_list_files_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_link_list_files_items_locale_idx" ON "pages_blocks_link_list_files_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_link_list_files_items_file_idx" ON "pages_blocks_link_list_files_items" USING btree ("file_id");
  CREATE INDEX "pages_blocks_link_list_order_idx" ON "pages_blocks_link_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_link_list_parent_id_idx" ON "pages_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_link_list_path_idx" ON "pages_blocks_link_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_link_list_locale_idx" ON "pages_blocks_link_list" USING btree ("_locale");
  CREATE INDEX "pages_blocks_next_links_links_order_idx" ON "pages_blocks_next_links_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_next_links_links_parent_id_idx" ON "pages_blocks_next_links_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_next_links_links_locale_idx" ON "pages_blocks_next_links_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_next_links_links_link_link_page_idx" ON "pages_blocks_next_links_links" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_next_links_order_idx" ON "pages_blocks_next_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_next_links_parent_id_idx" ON "pages_blocks_next_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_next_links_path_idx" ON "pages_blocks_next_links" USING btree ("_path");
  CREATE INDEX "pages_blocks_next_links_locale_idx" ON "pages_blocks_next_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_carousel_links_order_idx" ON "pages_blocks_video_carousel_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_carousel_links_parent_id_idx" ON "pages_blocks_video_carousel_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_carousel_links_locale_idx" ON "pages_blocks_video_carousel_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_features_items_order_idx" ON "_pages_v_blocks_features_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_items_parent_id_idx" ON "_pages_v_blocks_features_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_items_locale_idx" ON "_pages_v_blocks_features_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_features_items_image_idx" ON "_pages_v_blocks_features_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_features_items_link_link_page_idx" ON "_pages_v_blocks_features_items" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_features_order_idx" ON "_pages_v_blocks_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_features_parent_id_idx" ON "_pages_v_blocks_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_features_path_idx" ON "_pages_v_blocks_features" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_features_locale_idx" ON "_pages_v_blocks_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_work_rows_rows_order_idx" ON "_pages_v_blocks_work_rows_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_work_rows_rows_parent_id_idx" ON "_pages_v_blocks_work_rows_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_work_rows_rows_locale_idx" ON "_pages_v_blocks_work_rows_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_work_rows_rows_link_link_page_idx" ON "_pages_v_blocks_work_rows_rows" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_work_rows_rows_image_idx" ON "_pages_v_blocks_work_rows_rows" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_work_rows_order_idx" ON "_pages_v_blocks_work_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_work_rows_parent_id_idx" ON "_pages_v_blocks_work_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_work_rows_path_idx" ON "_pages_v_blocks_work_rows" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_work_rows_locale_idx" ON "_pages_v_blocks_work_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_fact_list_items_order_idx" ON "_pages_v_blocks_fact_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_fact_list_items_parent_id_idx" ON "_pages_v_blocks_fact_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_fact_list_items_locale_idx" ON "_pages_v_blocks_fact_list_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_fact_list_order_idx" ON "_pages_v_blocks_fact_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_fact_list_parent_id_idx" ON "_pages_v_blocks_fact_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_fact_list_path_idx" ON "_pages_v_blocks_fact_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_fact_list_locale_idx" ON "_pages_v_blocks_fact_list" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_stats_items_order_idx" ON "_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_items_parent_id_idx" ON "_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_items_locale_idx" ON "_pages_v_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_locale_idx" ON "_pages_v_blocks_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_checklist_items_order_idx" ON "_pages_v_blocks_checklist_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_checklist_items_parent_id_idx" ON "_pages_v_blocks_checklist_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_checklist_items_locale_idx" ON "_pages_v_blocks_checklist_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_checklist_order_idx" ON "_pages_v_blocks_checklist" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_checklist_parent_id_idx" ON "_pages_v_blocks_checklist" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_checklist_path_idx" ON "_pages_v_blocks_checklist" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_checklist_locale_idx" ON "_pages_v_blocks_checklist" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_items_order_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_items_parent_id_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_items_locale_idx" ON "_pages_v_blocks_gallery_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_items_image_idx" ON "_pages_v_blocks_gallery_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_locale_idx" ON "_pages_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_columns_columns_order_idx" ON "_pages_v_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_columns_columns_parent_id_idx" ON "_pages_v_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_columns_columns_locale_idx" ON "_pages_v_blocks_columns_columns" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_columns_order_idx" ON "_pages_v_blocks_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_columns_parent_id_idx" ON "_pages_v_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_columns_path_idx" ON "_pages_v_blocks_columns" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_columns_locale_idx" ON "_pages_v_blocks_columns" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_locale_idx" ON "_pages_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_link_link_page_idx" ON "_pages_v_blocks_callout" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_link_list_items_order_idx" ON "_pages_v_blocks_link_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_list_items_parent_id_idx" ON "_pages_v_blocks_link_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_items_locale_idx" ON "_pages_v_blocks_link_list_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_link_list_files_items_order_idx" ON "_pages_v_blocks_link_list_files_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_list_files_items_parent_id_idx" ON "_pages_v_blocks_link_list_files_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_files_items_locale_idx" ON "_pages_v_blocks_link_list_files_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_link_list_files_items_file_idx" ON "_pages_v_blocks_link_list_files_items" USING btree ("file_id");
  CREATE INDEX "_pages_v_blocks_link_list_order_idx" ON "_pages_v_blocks_link_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_link_list_parent_id_idx" ON "_pages_v_blocks_link_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_link_list_path_idx" ON "_pages_v_blocks_link_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_link_list_locale_idx" ON "_pages_v_blocks_link_list" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_next_links_links_order_idx" ON "_pages_v_blocks_next_links_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_next_links_links_parent_id_idx" ON "_pages_v_blocks_next_links_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_next_links_links_locale_idx" ON "_pages_v_blocks_next_links_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_next_links_links_link_link_page_idx" ON "_pages_v_blocks_next_links_links" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_next_links_order_idx" ON "_pages_v_blocks_next_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_next_links_parent_id_idx" ON "_pages_v_blocks_next_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_next_links_path_idx" ON "_pages_v_blocks_next_links" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_next_links_locale_idx" ON "_pages_v_blocks_next_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_video_carousel_links_order_idx" ON "_pages_v_blocks_video_carousel_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_carousel_links_parent_id_idx" ON "_pages_v_blocks_video_carousel_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_carousel_links_locale_idx" ON "_pages_v_blocks_video_carousel_links" USING btree ("_locale");
  CREATE INDEX "site_film_texts_order_idx" ON "site_film_texts" USING btree ("_order");
  CREATE INDEX "site_film_texts_parent_id_idx" ON "site_film_texts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_film_texts_locales_parent_id_locale_unique" ON "site_film_texts_locales" USING btree ("_parent_id","_locale");
  CREATE UNIQUE INDEX "site_locales_parent_id_locale_unique" ON "site_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "_site_v_version_film_texts_order_idx" ON "_site_v_version_film_texts" USING btree ("_order");
  CREATE INDEX "_site_v_version_film_texts_parent_id_idx" ON "_site_v_version_film_texts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_v_version_film_texts_locales_parent_id_locale_unique" ON "_site_v_version_film_texts_locales" USING btree ("_parent_id","_locale");
  CREATE UNIQUE INDEX "_site_v_locales_parent_id_locale_unique" ON "_site_v_locales" USING btree ("_parent_id","_locale");
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_badge_id_media_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_entries" ADD CONSTRAINT "pages_blocks_timeline_entries_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_badge_id_media_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section" ADD CONSTRAINT "_pages_v_blocks_section_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section" ADD CONSTRAINT "_pages_v_blocks_section_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_entries" ADD CONSTRAINT "_pages_v_blocks_timeline_entries_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  CREATE INDEX "pages_blocks_hero_badge_idx" ON "pages_blocks_hero" USING btree ("badge_id");
  CREATE INDEX "pages_blocks_section_image_idx" ON "pages_blocks_section" USING btree ("image_id");
  CREATE INDEX "pages_blocks_section_link_link_page_idx" ON "pages_blocks_section" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_timeline_entries_page_idx" ON "pages_blocks_timeline_entries" USING btree ("page_id");
  CREATE INDEX "_pages_v_blocks_hero_image_idx" ON "_pages_v_blocks_hero" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_hero_badge_idx" ON "_pages_v_blocks_hero" USING btree ("badge_id");
  CREATE INDEX "_pages_v_blocks_section_image_idx" ON "_pages_v_blocks_section" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_section_link_link_page_idx" ON "_pages_v_blocks_section" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_timeline_entries_page_idx" ON "_pages_v_blocks_timeline_entries" USING btree ("page_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_work_rows_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_work_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_fact_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_fact_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_link_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_link_list_files_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_link_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_next_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_next_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_video_carousel_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_work_rows_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_work_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_fact_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_fact_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_checklist_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_link_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_link_list_files_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_link_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_next_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_next_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_video_carousel_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_film_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_film_texts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_v_version_film_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_v_version_film_texts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_features_items" CASCADE;
  DROP TABLE "pages_blocks_features" CASCADE;
  DROP TABLE "pages_blocks_work_rows_rows" CASCADE;
  DROP TABLE "pages_blocks_work_rows" CASCADE;
  DROP TABLE "pages_blocks_fact_list_items" CASCADE;
  DROP TABLE "pages_blocks_fact_list" CASCADE;
  DROP TABLE "pages_blocks_stats_items" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_checklist_items" CASCADE;
  DROP TABLE "pages_blocks_checklist" CASCADE;
  DROP TABLE "pages_blocks_gallery_items" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_columns_columns" CASCADE;
  DROP TABLE "pages_blocks_columns" CASCADE;
  DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "pages_blocks_link_list_items" CASCADE;
  DROP TABLE "pages_blocks_link_list_files_items" CASCADE;
  DROP TABLE "pages_blocks_link_list" CASCADE;
  DROP TABLE "pages_blocks_next_links_links" CASCADE;
  DROP TABLE "pages_blocks_next_links" CASCADE;
  DROP TABLE "pages_blocks_video_carousel_links" CASCADE;
  DROP TABLE "_pages_v_blocks_features_items" CASCADE;
  DROP TABLE "_pages_v_blocks_features" CASCADE;
  DROP TABLE "_pages_v_blocks_work_rows_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_work_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_fact_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_fact_list" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_checklist_items" CASCADE;
  DROP TABLE "_pages_v_blocks_checklist" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_columns_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list_files_items" CASCADE;
  DROP TABLE "_pages_v_blocks_link_list" CASCADE;
  DROP TABLE "_pages_v_blocks_next_links_links" CASCADE;
  DROP TABLE "_pages_v_blocks_next_links" CASCADE;
  DROP TABLE "_pages_v_blocks_video_carousel_links" CASCADE;
  DROP TABLE "site_film_texts" CASCADE;
  DROP TABLE "site_film_texts_locales" CASCADE;
  DROP TABLE "site_locales" CASCADE;
  DROP TABLE "_site_v_version_film_texts" CASCADE;
  DROP TABLE "_site_v_version_film_texts_locales" CASCADE;
  DROP TABLE "_site_v_locales" CASCADE;
  ALTER TABLE "pages_blocks_hero" DROP CONSTRAINT "pages_blocks_hero_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_hero" DROP CONSTRAINT "pages_blocks_hero_badge_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_section" DROP CONSTRAINT "pages_blocks_section_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_section" DROP CONSTRAINT "pages_blocks_section_link_page_id_pages_id_fk";
  
  ALTER TABLE "pages_blocks_timeline_entries" DROP CONSTRAINT "pages_blocks_timeline_entries_page_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_blocks_hero" DROP CONSTRAINT "_pages_v_blocks_hero_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_hero" DROP CONSTRAINT "_pages_v_blocks_hero_badge_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_section" DROP CONSTRAINT "_pages_v_blocks_section_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_section" DROP CONSTRAINT "_pages_v_blocks_section_link_page_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_blocks_timeline_entries" DROP CONSTRAINT "_pages_v_blocks_timeline_entries_page_id_pages_id_fk";
  
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "demo" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_hero_demo";
  CREATE TYPE "public"."enum_pages_blocks_hero_demo" AS ENUM('paper-to-deliverable', 'nexcan-case', 'photo-bench', 'screening-toy', 'luma-video', 'recipe-ingestion', 'recipe2video-validation', 'recipe2video-videos', 'build-log', 'hostile-review', 'background-video', 'ask-this-site', 'accounting-agent');
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "demo" SET DATA TYPE "public"."enum_pages_blocks_hero_demo" USING "demo"::"public"."enum_pages_blocks_hero_demo";
  ALTER TABLE "pages_blocks_demo" ALTER COLUMN "demo" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_demo_demo";
  CREATE TYPE "public"."enum_pages_blocks_demo_demo" AS ENUM('paper-to-deliverable', 'nexcan-case', 'photo-bench', 'screening-toy', 'luma-video', 'recipe-ingestion', 'recipe2video-validation', 'recipe2video-videos', 'build-log', 'hostile-review', 'background-video', 'ask-this-site', 'accounting-agent');
  ALTER TABLE "pages_blocks_demo" ALTER COLUMN "demo" SET DATA TYPE "public"."enum_pages_blocks_demo_demo" USING "demo"::"public"."enum_pages_blocks_demo_demo";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "demo" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_hero_demo";
  CREATE TYPE "public"."enum__pages_v_blocks_hero_demo" AS ENUM('paper-to-deliverable', 'nexcan-case', 'photo-bench', 'screening-toy', 'luma-video', 'recipe-ingestion', 'recipe2video-validation', 'recipe2video-videos', 'build-log', 'hostile-review', 'background-video', 'ask-this-site', 'accounting-agent');
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "demo" SET DATA TYPE "public"."enum__pages_v_blocks_hero_demo" USING "demo"::"public"."enum__pages_v_blocks_hero_demo";
  ALTER TABLE "_pages_v_blocks_demo" ALTER COLUMN "demo" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_demo_demo";
  CREATE TYPE "public"."enum__pages_v_blocks_demo_demo" AS ENUM('paper-to-deliverable', 'nexcan-case', 'photo-bench', 'screening-toy', 'luma-video', 'recipe-ingestion', 'recipe2video-validation', 'recipe2video-videos', 'build-log', 'hostile-review', 'background-video', 'ask-this-site', 'accounting-agent');
  ALTER TABLE "_pages_v_blocks_demo" ALTER COLUMN "demo" SET DATA TYPE "public"."enum__pages_v_blocks_demo_demo" USING "demo"::"public"."enum__pages_v_blocks_demo_demo";
  DROP INDEX "pages_blocks_hero_image_idx";
  DROP INDEX "pages_blocks_hero_badge_idx";
  DROP INDEX "pages_blocks_section_image_idx";
  DROP INDEX "pages_blocks_section_link_link_page_idx";
  DROP INDEX "pages_blocks_timeline_entries_page_idx";
  DROP INDEX "_pages_v_blocks_hero_image_idx";
  DROP INDEX "_pages_v_blocks_hero_badge_idx";
  DROP INDEX "_pages_v_blocks_section_image_idx";
  DROP INDEX "_pages_v_blocks_section_link_link_page_idx";
  DROP INDEX "_pages_v_blocks_timeline_entries_page_idx";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "status";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "image_id";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "badge_id";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "number";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "image_id";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "tag";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "image_caption";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "image_side";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "demo";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "demo_caption";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "details_label";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "details";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "link_page_id";
  ALTER TABLE "pages_blocks_section" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_demo" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_timeline_entries" DROP COLUMN "page_id";
  ALTER TABLE "pages_blocks_timeline" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_video_carousel" DROP COLUMN "labels_previous";
  ALTER TABLE "pages_blocks_video_carousel" DROP COLUMN "labels_next";
  ALTER TABLE "pages_blocks_video_carousel" DROP COLUMN "labels_autoplay";
  ALTER TABLE "pages_blocks_spotify" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_rive" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_rive" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "status";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "image_id";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "badge_id";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "number";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "image_id";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "tag";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "image_caption";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "image_side";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "demo";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "demo_caption";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "details_label";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "details";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "link_page_id";
  ALTER TABLE "_pages_v_blocks_section" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_demo" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_timeline_entries" DROP COLUMN "page_id";
  ALTER TABLE "_pages_v_blocks_timeline" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_video_carousel" DROP COLUMN "labels_previous";
  ALTER TABLE "_pages_v_blocks_video_carousel" DROP COLUMN "labels_next";
  ALTER TABLE "_pages_v_blocks_video_carousel" DROP COLUMN "labels_autoplay";
  ALTER TABLE "_pages_v_blocks_spotify" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_rive" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_rive" DROP COLUMN "body";
  DROP TYPE "public"."enum_pages_blocks_section_image_side";
  DROP TYPE "public"."enum_pages_blocks_section_demo";
  DROP TYPE "public"."enum_pages_blocks_features_items_demo";
  DROP TYPE "public"."enum_pages_blocks_work_rows_rows_tone";
  DROP TYPE "public"."enum_pages_blocks_fact_list_columns";
  DROP TYPE "public"."enum_pages_blocks_gallery_variant";
  DROP TYPE "public"."enum_pages_blocks_callout_tone";
  DROP TYPE "public"."enum__pages_v_blocks_section_image_side";
  DROP TYPE "public"."enum__pages_v_blocks_section_demo";
  DROP TYPE "public"."enum__pages_v_blocks_features_items_demo";
  DROP TYPE "public"."enum__pages_v_blocks_work_rows_rows_tone";
  DROP TYPE "public"."enum__pages_v_blocks_fact_list_columns";
  DROP TYPE "public"."enum__pages_v_blocks_gallery_variant";
  DROP TYPE "public"."enum__pages_v_blocks_callout_tone";
  DROP TYPE "public"."enum_site_film_texts_film";
  DROP TYPE "public"."enum__site_v_version_film_texts_film";`)
}
