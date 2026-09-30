import { z } from "zod";

export const GRIEVANCE_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const uuidParam = z.object({ id: z.uuid("Invalid id") });

export const referenceIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^OGRSA-\d{4}-\d{6}$/, "Reference ID must look like OGRSA-2026-000001");

export const createGrievanceSchema = z.object({
  categoryId: z.uuid("Please choose a valid category"),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(5000),
  location: z.string().trim().max(255).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid mobile number")
    .optional()
    .or(z.literal("")),
});

export const addInfoSchema = z.object({
  additionalInfo: z
    .string()
    .trim()
    .min(5, "Please write at least 5 characters")
    .max(3000),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(200).optional(),
  status: z.enum(GRIEVANCE_STATUSES).optional(),
  categoryId: z.uuid().optional(),
  priority: z.enum(PRIORITIES).optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "priority", "status"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export const updateStatusSchema = z.object({
  status: z.enum(GRIEVANCE_STATUSES),
  remark: z.string().trim().max(2000).optional().or(z.literal("")),
  department: z.string().trim().max(120).optional().or(z.literal("")),
});

export const remarkSchema = z.object({
  remark: z.string().trim().min(3, "Remark is too short").max(2000),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  active: z.boolean().optional(),
});

export const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating 1-5").max(5, "Rating 1-5"),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid mobile number")
    .optional()
    .or(z.literal("")),
});

export const awarenessSchema = z.object({
  section: z.enum(["TIP", "FAQ"]).default("TIP"),
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10).max(5000),
  displayOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().optional(),
});
