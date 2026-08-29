import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum, index, varchar } from "drizzle-orm/pg-core";

export const serviceCategoryEnum = pgEnum("service_category", ["photography", "videography", "editing", "combo", "drone"]);
export const eventStatusEnum = pgEnum("event_status", ["upcoming", "ongoing", "completed", "cancelled"]);
export const staffRoleEnum = pgEnum("staff_role", ["photographer", "videographer", "editor", "drone_operator", "manager"]);

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  category: serviceCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  basePrice: integer("base_price").notNull(), // paise
  durationMins: integer("duration_mins").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("services_category_idx").on(t.category), index("services_active_idx").on(t.isActive)]);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: eventStatusEnum("status").default("upcoming").notNull(),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("events_start_idx").on(t.startDate), index("events_status_idx").on(t.status)]);

export const galleryItems = pgTable("gallery_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  eventId: uuid("event_id").references(() => events.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  role: staffRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("staff_role_idx").on(t.role)]);

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  keywords: text("keywords").array().notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enquiryTypeEnum = pgEnum("enquiry_type", ["general", "videography", "photography", "video_editing", "drone", "combo", "brand_campaign", "corporate"]);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  enquiryDetails: text("enquiry_details").notNull(),
  enquiryType: enquiryTypeEnum("enquiry_type").default("general").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("leads_email_idx").on(t.email), index("leads_created_idx").on(t.createdAt)]);

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]);

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").references(() => services.id),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  bookingDate: timestamp("booking_date", { withTimezone: true }).notNull(),
  startTime: text("start_time").notNull(), // "09:00" 30m slot
  endTime: text("end_time").notNull(), // "13:00"
  status: bookingStatusEnum("status").default("pending").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("bookings_date_idx").on(t.bookingDate), index("bookings_status_idx").on(t.status), index("bookings_city_idx").on(t.city)]);

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  role: userRoleEnum("role").default("customer").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("users_clerk_idx").on(t.clerkId), index("users_email_idx").on(t.email)]);
