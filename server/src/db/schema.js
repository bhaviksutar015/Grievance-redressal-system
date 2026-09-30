/**
 * OGRSA — Drizzle ORM schema (Neon PostgreSQL)
 *
 * NOTE ON NEON AUTH:
 *  Authentication identity (users, sessions, credentials) is fully managed by
 *  Neon Auth (Managed Better Auth) inside the `neon_auth` schema.
 *  We NEVER modify those tables. Application tables reference the Neon Auth
 *  user through `profiles.auth_user_id` (the JWT `sub` claim).
 *  No passwords are ever stored in application tables.
 */
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* ---------------------------------- enums --------------------------------- */

export const roleEnum = pgEnum("user_role", ["CITIZEN", "ADMIN"]);

export const grievanceStatusEnum = pgEnum("grievance_status", [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
]);

export const priorityEnum = pgEnum("grievance_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

/* -------------------------------- profiles -------------------------------- */

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Neon Auth user id (JWT `sub`). Identity itself lives in neon_auth.*
    authUserId: text("auth_user_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    mobile: varchar("mobile", { length: 15 }),
    role: roleEnum("role").notNull().default("CITIZEN"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("profiles_auth_user_id_uq").on(t.authUserId),
    index("profiles_role_idx").on(t.role),
  ]
);

/* ------------------------------- categories ------------------------------- */

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("categories_name_uq").on(t.name)]
);

/* ------------------------------- grievances ------------------------------- */

export const grievances = pgTable(
  "grievances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Public reference (OGRSA-2026-000001). Never expose raw DB ids publicly.
    referenceId: varchar("reference_id", { length: 24 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    subject: varchar("subject", { length: 200 }).notNull(),
    description: text("description").notNull(),
    location: varchar("location", { length: 255 }),
    department: varchar("department", { length: 120 }),
    priority: priorityEnum("priority").notNull().default("MEDIUM"),
    status: grievanceStatusEnum("status").notNull().default("SUBMITTED"),
    assignedTo: uuid("assigned_to").references(() => profiles.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("grievances_reference_id_uq").on(t.referenceId),
    index("grievances_user_id_idx").on(t.userId),
    index("grievances_category_id_idx").on(t.categoryId),
    index("grievances_status_idx").on(t.status),
    index("grievances_priority_idx").on(t.priority),
    index("grievances_created_at_idx").on(t.createdAt),
    check("grievances_subject_len_ck", sql`char_length(${t.subject}) >= 5`),
    check("grievances_description_len_ck", sql`char_length(${t.description}) >= 20`),
  ]
);

/* ----------------------------- status history ----------------------------- */

export const statusHistory = pgTable(
  "status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    grievanceId: uuid("grievance_id")
      .notNull()
      .references(() => grievances.id, { onDelete: "cascade" }),
    status: grievanceStatusEnum("status").notNull(),
    remark: text("remark"),
    updatedBy: uuid("updated_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("status_history_grievance_id_idx").on(t.grievanceId),
    index("status_history_created_at_idx").on(t.createdAt),
  ]
);

/* ------------------------------ notifications ----------------------------- */

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    grievanceId: uuid("grievance_id").references(() => grievances.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 150 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("notifications_user_id_idx").on(t.userId),
    index("notifications_user_unread_idx").on(t.userId, t.isRead),
  ]
);

/* --------------------------------- feedback -------------------------------- */

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    grievanceId: uuid("grievance_id")
      .notNull()
      .references(() => grievances.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // one feedback per grievance
    uniqueIndex("feedback_grievance_uq").on(t.grievanceId),
    index("feedback_user_id_idx").on(t.userId),
    check("feedback_rating_ck", sql`${t.rating} BETWEEN 1 AND 5`),
  ]
);

/* -------------------------------- attachments ------------------------------ */

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    grievanceId: uuid("grievance_id")
      .notNull()
      .references(() => grievances.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    storageKey: varchar("storage_key", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("attachments_grievance_id_idx").on(t.grievanceId),
    check("attachments_size_ck", sql`${t.fileSize} > 0 AND ${t.fileSize} <= 5242880`),
  ]
);

/* ----------------------------- awareness content --------------------------- */

export const awarenessContent = pgTable(
  "awareness_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    section: varchar("section", { length: 50 }).notNull().default("TIP"), // TIP | FAQ
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("awareness_active_order_idx").on(t.active, t.displayOrder)]
);
