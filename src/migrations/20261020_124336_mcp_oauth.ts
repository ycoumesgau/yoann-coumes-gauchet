import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_deletion_requests_target_collection" AS ENUM('pages', 'projects', 'media');
  CREATE TYPE "public"."enum_deletion_requests_status" AS ENUM('pending', 'confirmed', 'cancelled');
  CREATE TYPE "public"."enum_mcp_authorizations_revoked_reason" AS ENUM('refresh_reuse', 'code_reuse');
  CREATE TYPE "public"."enum_mcp_events_type" AS ENUM('consent_granted', 'consent_denied', 'token_issued', 'token_refreshed', 'token_refused', 'lineage_revoked', 'tool_call');
  CREATE TABLE "deletion_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"target_collection" "enum_deletion_requests_target_collection" NOT NULL,
  	"target_id" varchar NOT NULL,
  	"target_title" varchar NOT NULL,
  	"reason" varchar,
  	"status" "enum_deletion_requests_status" DEFAULT 'pending' NOT NULL,
  	"decided_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "deletion_requests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "mcp_authorizations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"client_id" varchar NOT NULL,
  	"code_hash" varchar NOT NULL,
  	"refresh_token_hash" varchar,
  	"rotated_refresh_hashes" jsonb,
  	"last_used_at" timestamp(3) with time zone NOT NULL,
  	"revoked_at" timestamp(3) with time zone,
  	"revoked_reason" "enum_mcp_authorizations_revoked_reason",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mcp_authorizations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "mcp_authorization_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code_hash" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"client_id" varchar NOT NULL,
  	"redirect_uri" varchar NOT NULL,
  	"code_challenge" varchar NOT NULL,
  	"resource" varchar,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mcp_authorization_codes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "mcp_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_mcp_events_type" NOT NULL,
  	"user_id" integer,
  	"authorization" varchar,
  	"client_id" varchar,
  	"tool" varchar,
  	"target" varchar,
  	"is_error" boolean,
  	"details" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mcp_events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "deletion_requests_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mcp_authorizations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mcp_authorization_codes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "mcp_events_id" integer;
  ALTER TABLE "deletion_requests_rels" ADD CONSTRAINT "deletion_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."deletion_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "deletion_requests_rels" ADD CONSTRAINT "deletion_requests_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mcp_authorizations" ADD CONSTRAINT "mcp_authorizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mcp_authorizations_rels" ADD CONSTRAINT "mcp_authorizations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mcp_authorizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mcp_authorizations_rels" ADD CONSTRAINT "mcp_authorizations_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mcp_authorization_codes" ADD CONSTRAINT "mcp_authorization_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mcp_authorization_codes_rels" ADD CONSTRAINT "mcp_authorization_codes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mcp_authorization_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mcp_authorization_codes_rels" ADD CONSTRAINT "mcp_authorization_codes_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mcp_events" ADD CONSTRAINT "mcp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mcp_events_rels" ADD CONSTRAINT "mcp_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mcp_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mcp_events_rels" ADD CONSTRAINT "mcp_events_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "deletion_requests_updated_at_idx" ON "deletion_requests" USING btree ("updated_at");
  CREATE INDEX "deletion_requests_created_at_idx" ON "deletion_requests" USING btree ("created_at");
  CREATE INDEX "deletion_requests_rels_order_idx" ON "deletion_requests_rels" USING btree ("order");
  CREATE INDEX "deletion_requests_rels_parent_idx" ON "deletion_requests_rels" USING btree ("parent_id");
  CREATE INDEX "deletion_requests_rels_path_idx" ON "deletion_requests_rels" USING btree ("path");
  CREATE INDEX "deletion_requests_rels_users_id_idx" ON "deletion_requests_rels" USING btree ("users_id");
  CREATE INDEX "mcp_authorizations_user_idx" ON "mcp_authorizations" USING btree ("user_id");
  CREATE UNIQUE INDEX "mcp_authorizations_code_hash_idx" ON "mcp_authorizations" USING btree ("code_hash");
  CREATE INDEX "mcp_authorizations_updated_at_idx" ON "mcp_authorizations" USING btree ("updated_at");
  CREATE INDEX "mcp_authorizations_created_at_idx" ON "mcp_authorizations" USING btree ("created_at");
  CREATE INDEX "mcp_authorizations_rels_order_idx" ON "mcp_authorizations_rels" USING btree ("order");
  CREATE INDEX "mcp_authorizations_rels_parent_idx" ON "mcp_authorizations_rels" USING btree ("parent_id");
  CREATE INDEX "mcp_authorizations_rels_path_idx" ON "mcp_authorizations_rels" USING btree ("path");
  CREATE INDEX "mcp_authorizations_rels_users_id_idx" ON "mcp_authorizations_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "mcp_authorization_codes_code_hash_idx" ON "mcp_authorization_codes" USING btree ("code_hash");
  CREATE INDEX "mcp_authorization_codes_user_idx" ON "mcp_authorization_codes" USING btree ("user_id");
  CREATE INDEX "mcp_authorization_codes_updated_at_idx" ON "mcp_authorization_codes" USING btree ("updated_at");
  CREATE INDEX "mcp_authorization_codes_created_at_idx" ON "mcp_authorization_codes" USING btree ("created_at");
  CREATE INDEX "mcp_authorization_codes_rels_order_idx" ON "mcp_authorization_codes_rels" USING btree ("order");
  CREATE INDEX "mcp_authorization_codes_rels_parent_idx" ON "mcp_authorization_codes_rels" USING btree ("parent_id");
  CREATE INDEX "mcp_authorization_codes_rels_path_idx" ON "mcp_authorization_codes_rels" USING btree ("path");
  CREATE INDEX "mcp_authorization_codes_rels_users_id_idx" ON "mcp_authorization_codes_rels" USING btree ("users_id");
  CREATE INDEX "mcp_events_user_idx" ON "mcp_events" USING btree ("user_id");
  CREATE INDEX "mcp_events_updated_at_idx" ON "mcp_events" USING btree ("updated_at");
  CREATE INDEX "mcp_events_created_at_idx" ON "mcp_events" USING btree ("created_at");
  CREATE INDEX "mcp_events_rels_order_idx" ON "mcp_events_rels" USING btree ("order");
  CREATE INDEX "mcp_events_rels_parent_idx" ON "mcp_events_rels" USING btree ("parent_id");
  CREATE INDEX "mcp_events_rels_path_idx" ON "mcp_events_rels" USING btree ("path");
  CREATE INDEX "mcp_events_rels_users_id_idx" ON "mcp_events_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_deletion_requests_fk" FOREIGN KEY ("deletion_requests_id") REFERENCES "public"."deletion_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mcp_authorizations_fk" FOREIGN KEY ("mcp_authorizations_id") REFERENCES "public"."mcp_authorizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mcp_authorization_codes_fk" FOREIGN KEY ("mcp_authorization_codes_id") REFERENCES "public"."mcp_authorization_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mcp_events_fk" FOREIGN KEY ("mcp_events_id") REFERENCES "public"."mcp_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_deletion_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("deletion_requests_id");
  CREATE INDEX "payload_locked_documents_rels_mcp_authorizations_id_idx" ON "payload_locked_documents_rels" USING btree ("mcp_authorizations_id");
  CREATE INDEX "payload_locked_documents_rels_mcp_authorization_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("mcp_authorization_codes_id");
  CREATE INDEX "payload_locked_documents_rels_mcp_events_id_idx" ON "payload_locked_documents_rels" USING btree ("mcp_events_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "deletion_requests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "deletion_requests_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mcp_authorizations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mcp_authorizations_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mcp_authorization_codes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mcp_authorization_codes_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mcp_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "mcp_events_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "deletion_requests" CASCADE;
  DROP TABLE "deletion_requests_rels" CASCADE;
  DROP TABLE "mcp_authorizations" CASCADE;
  DROP TABLE "mcp_authorizations_rels" CASCADE;
  DROP TABLE "mcp_authorization_codes" CASCADE;
  DROP TABLE "mcp_authorization_codes_rels" CASCADE;
  DROP TABLE "mcp_events" CASCADE;
  DROP TABLE "mcp_events_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_deletion_requests_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mcp_authorizations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mcp_authorization_codes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mcp_events_fk";
  
  DROP INDEX "payload_locked_documents_rels_deletion_requests_id_idx";
  DROP INDEX "payload_locked_documents_rels_mcp_authorizations_id_idx";
  DROP INDEX "payload_locked_documents_rels_mcp_authorization_codes_id_idx";
  DROP INDEX "payload_locked_documents_rels_mcp_events_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "deletion_requests_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mcp_authorizations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mcp_authorization_codes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "mcp_events_id";
  DROP TYPE "public"."enum_deletion_requests_target_collection";
  DROP TYPE "public"."enum_deletion_requests_status";
  DROP TYPE "public"."enum_mcp_authorizations_revoked_reason";
  DROP TYPE "public"."enum_mcp_events_type";`)
}
