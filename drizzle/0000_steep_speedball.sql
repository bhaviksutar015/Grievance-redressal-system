CREATE TYPE "public"."grievance_status" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."grievance_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CITIZEN', 'ADMIN');--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grievance_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"storage_key" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attachments_size_ck" CHECK ("attachments"."file_size" > 0 AND "attachments"."file_size" <= 5242880)
);
--> statement-breakpoint
CREATE TABLE "awareness_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" varchar(50) DEFAULT 'TIP' NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grievance_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_rating_ck" CHECK ("feedback"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "grievances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_id" varchar(24) NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"subject" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"location" varchar(255),
	"department" varchar(120),
	"priority" "grievance_priority" DEFAULT 'MEDIUM' NOT NULL,
	"status" "grievance_status" DEFAULT 'SUBMITTED' NOT NULL,
	"assigned_to" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grievances_subject_len_ck" CHECK (char_length("grievances"."subject") >= 5),
	CONSTRAINT "grievances_description_len_ck" CHECK (char_length("grievances"."description") >= 20)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"grievance_id" uuid,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"mobile" varchar(15),
	"role" "user_role" DEFAULT 'CITIZEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grievance_id" uuid NOT NULL,
	"status" "grievance_status" NOT NULL,
	"remark" text,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_grievance_id_grievances_id_fk" FOREIGN KEY ("grievance_id") REFERENCES "public"."grievances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_grievance_id_grievances_id_fk" FOREIGN KEY ("grievance_id") REFERENCES "public"."grievances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_grievance_id_grievances_id_fk" FOREIGN KEY ("grievance_id") REFERENCES "public"."grievances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_grievance_id_grievances_id_fk" FOREIGN KEY ("grievance_id") REFERENCES "public"."grievances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_updated_by_profiles_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_grievance_id_idx" ON "attachments" USING btree ("grievance_id");--> statement-breakpoint
CREATE INDEX "awareness_active_order_idx" ON "awareness_content" USING btree ("active","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_uq" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "feedback_grievance_uq" ON "feedback" USING btree ("grievance_id");--> statement-breakpoint
CREATE INDEX "feedback_user_id_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grievances_reference_id_uq" ON "grievances" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "grievances_user_id_idx" ON "grievances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "grievances_category_id_idx" ON "grievances" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "grievances_status_idx" ON "grievances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "grievances_priority_idx" ON "grievances" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "grievances_created_at_idx" ON "grievances" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_auth_user_id_uq" ON "profiles" USING btree ("auth_user_id");--> statement-breakpoint
CREATE INDEX "profiles_role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "status_history_grievance_id_idx" ON "status_history" USING btree ("grievance_id");--> statement-breakpoint
CREATE INDEX "status_history_created_at_idx" ON "status_history" USING btree ("created_at");