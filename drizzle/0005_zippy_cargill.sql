ALTER TABLE "bookings" ADD COLUMN "assigned_staff_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "assigned_staff_id" uuid;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "employee_number" text;--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "work_description" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_staff_id_staff_id_fk" FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_staff_id_staff_id_fk" FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_assigned_staff_idx" ON "bookings" USING btree ("assigned_staff_id");--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_employee_number_unique" UNIQUE("employee_number");