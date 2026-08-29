CREATE TYPE "public"."enquiry_type" AS ENUM('general', 'videography', 'photography', 'video_editing', 'drone', 'combo', 'brand_campaign', 'corporate');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"enquiry_details" text NOT NULL,
	"enquiry_type" "enquiry_type" DEFAULT 'general' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_created_idx" ON "leads" USING btree ("created_at");