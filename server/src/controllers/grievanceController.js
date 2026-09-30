import { and, count, desc, asc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db, schema } from "../db/client.js";
import { ApiError } from "../utils/apiError.js";
import { nextReferenceId } from "../services/referenceService.js";
import { notifyStatus, notifyCustom } from "../services/notificationService.js";

const { grievances, categories, statusHistory, attachments, feedback, profiles } =
  schema;

/* ------------------------------ helpers ----------------------------------- */

function baseFilters(q, extra = []) {
  const filters = [...extra];
  if (q.status) filters.push(eq(grievances.status, q.status));
  if (q.categoryId) filters.push(eq(grievances.categoryId, q.categoryId));
  if (q.priority) filters.push(eq(grievances.priority, q.priority));
  if (q.from) filters.push(gte(grievances.createdAt, new Date(`${q.from}T00:00:00Z`)));
  if (q.to) filters.push(lte(grievances.createdAt, new Date(`${q.to}T23:59:59Z`)));
  if (q.search) {
    const term = `%${q.search}%`;
    filters.push(
      or(ilike(grievances.subject, term), ilike(grievances.referenceId, term))
    );
  }
  return filters.length ? and(...filters) : undefined;
}

const sortColumns = {
  createdAt: grievances.createdAt,
  updatedAt: grievances.updatedAt,
  priority: grievances.priority,
  status: grievances.status,
};

async function listGrievances(q, extraFilters = []) {
  const where = baseFilters(q, extraFilters);
  const orderCol = sortColumns[q.sortBy] ?? grievances.createdAt;
  const orderFn = q.sortDir === "asc" ? asc : desc;
  const offset = (q.page - 1) * q.limit;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: grievances.id,
        referenceId: grievances.referenceId,
        subject: grievances.subject,
        status: grievances.status,
        priority: grievances.priority,
        department: grievances.department,
        location: grievances.location,
        createdAt: grievances.createdAt,
        updatedAt: grievances.updatedAt,
        resolvedAt: grievances.resolvedAt,
        category: categories.name,
        categoryId: grievances.categoryId,
        userId: grievances.userId,
      })
      .from(grievances)
      .innerJoin(categories, eq(grievances.categoryId, categories.id))
      .where(where)
      .orderBy(orderFn(orderCol), desc(grievances.id))
      .limit(q.limit)
      .offset(offset),
    db.select({ total: count() }).from(grievances).where(where),
  ]);

  return {
    items: rows,
    pagination: {
      page: q.page,
      limit: q.limit,
      total: Number(total),
      totalPages: Math.max(1, Math.ceil(Number(total) / q.limit)),
    },
  };
}

async function loadFullGrievance(id) {
  const [g] = await db
    .select({
      id: grievances.id,
      referenceId: grievances.referenceId,
      subject: grievances.subject,
      description: grievances.description,
      location: grievances.location,
      department: grievances.department,
      priority: grievances.priority,
      status: grievances.status,
      createdAt: grievances.createdAt,
      updatedAt: grievances.updatedAt,
      resolvedAt: grievances.resolvedAt,
      userId: grievances.userId,
      categoryId: grievances.categoryId,
      category: categories.name,
    })
    .from(grievances)
    .innerJoin(categories, eq(grievances.categoryId, categories.id))
    .where(eq(grievances.id, id))
    .limit(1);
  if (!g) return null;

  const [history, files, [fb]] = await Promise.all([
    db
      .select({
        id: statusHistory.id,
        status: statusHistory.status,
        remark: statusHistory.remark,
        createdAt: statusHistory.createdAt,
        updatedByName: profiles.name,
        updatedByRole: profiles.role,
      })
      .from(statusHistory)
      .leftJoin(profiles, eq(statusHistory.updatedBy, profiles.id))
      .where(eq(statusHistory.grievanceId, id))
      .orderBy(asc(statusHistory.createdAt)),
    db
      .select({
        id: attachments.id,
        fileName: attachments.fileName,
        storageKey: attachments.storageKey,
        mimeType: attachments.mimeType,
        fileSize: attachments.fileSize,
        uploadedAt: attachments.uploadedAt,
      })
      .from(attachments)
      .where(eq(attachments.grievanceId, id)),
    db
      .select({
        id: feedback.id,
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .where(eq(feedback.grievanceId, id))
      .limit(1),
  ]);

  return { ...g, history, attachments: files, feedback: fb ?? null };
}

/* ------------------------------ handlers ---------------------------------- */

/** POST /api/grievances  (multipart: fields + optional files[]) */
export async function createGrievance(req, res) {
  const profile = req.profile;
  const data = req.body;

  // category must exist & be active
  const [cat] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, data.categoryId), eq(categories.active, true)))
    .limit(1);
  if (!cat) throw ApiError.badRequest("Selected category is not available");

  const files = req.files ?? [];

  const created = await db.transaction(async (tx) => {
    const referenceId = await nextReferenceId(tx);

    const [g] = await tx
      .insert(schema.grievances)
      .values({
        referenceId,
        userId: profile.id,
        categoryId: data.categoryId,
        subject: data.subject,
        description: data.description,
        location: data.location || null,
        department: data.department || null,
        priority: data.priority,
        status: "SUBMITTED",
      })
      .returning();

    await tx.insert(schema.statusHistory).values({
      grievanceId: g.id,
      status: "SUBMITTED",
      remark: "Grievance submitted by citizen",
      updatedBy: profile.id,
    });

    if (files.length) {
      await tx.insert(schema.attachments).values(
        files.map((f) => ({
          grievanceId: g.id,
          fileName: f.originalname.slice(0, 255),
          storageKey: f.filename,
          mimeType: f.mimetype,
          fileSize: f.size,
        }))
      );
    }

    // optional: update citizen mobile provided on the form
    if (data.mobile) {
      await tx
        .update(schema.profiles)
        .set({ mobile: data.mobile, updatedAt: new Date() })
        .where(eq(schema.profiles.id, profile.id));
    }

    await notifyStatus(tx, {
      userId: profile.id,
      grievanceId: g.id,
      referenceId,
      status: "SUBMITTED",
    });

    return g;
  });

  res.status(201).json({
    success: true,
    message: "Your grievance has been successfully submitted.",
    data: {
      id: created.id,
      referenceId: created.referenceId,
      status: created.status,
      createdAt: created.createdAt,
    },
  });
}

/** GET /api/grievances/my — always scoped to the authenticated profile */
export async function myGrievances(req, res) {
  const q = req.validatedQuery;
  const result = await listGrievances(q, [eq(grievances.userId, req.profile.id)]);
  res.json({ success: true, data: result });
}

/** GET /api/grievances/:id — ownership enforced (404 for others' grievances) */
export async function getGrievance(req, res) {
  const g = await loadFullGrievance(req.params.id);
  // Ownership check: citizens only see their own; admins use /api/admin routes.
  if (!g || g.userId !== req.profile.id) {
    throw ApiError.notFound("Grievance not found");
  }
  res.json({ success: true, data: g });
}

/** PUT /api/grievances/:id — citizen adds additional information */
export async function addAdditionalInfo(req, res) {
  const [g] = await db
    .select()
    .from(grievances)
    .where(and(eq(grievances.id, req.params.id), eq(grievances.userId, req.profile.id)))
    .limit(1);
  if (!g) throw ApiError.notFound("Grievance not found");
  if (["RESOLVED", "REJECTED"].includes(g.status)) {
    throw ApiError.conflict("This grievance is closed and can no longer be updated.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(schema.grievances)
      .set({
        description: `${g.description}\n\n--- Additional information (${new Date().toLocaleDateString("en-IN")}) ---\n${req.body.additionalInfo}`,
        updatedAt: new Date(),
      })
      .where(eq(schema.grievances.id, g.id));
    await tx.insert(schema.statusHistory).values({
      grievanceId: g.id,
      status: g.status,
      remark: "Citizen added additional information",
      updatedBy: req.profile.id,
    });
  });

  res.json({ success: true, message: "Additional information added." });
}

/** GET /api/grievances/track/:referenceId — PUBLIC, safe fields only */
export async function trackGrievance(req, res) {
  const ref = req.params.referenceId?.trim().toUpperCase();
  if (!/^OGRSA-\d{4}-\d{6}$/.test(ref ?? "")) {
    throw ApiError.badRequest("Reference ID must look like OGRSA-2026-000001");
  }

  const [g] = await db
    .select({
      id: grievances.id,
      referenceId: grievances.referenceId,
      subject: grievances.subject,
      status: grievances.status,
      createdAt: grievances.createdAt,
      updatedAt: grievances.updatedAt,
      resolvedAt: grievances.resolvedAt,
      category: categories.name,
    })
    .from(grievances)
    .innerJoin(categories, eq(grievances.categoryId, categories.id))
    .where(eq(grievances.referenceId, ref))
    .limit(1);
  if (!g) throw ApiError.notFound("No grievance found for this reference ID");

  // Public timeline: status transitions only — no remarks, no names, no PII.
  const history = await db
    .select({ status: statusHistory.status, createdAt: statusHistory.createdAt })
    .from(statusHistory)
    .where(eq(statusHistory.grievanceId, g.id))
    .orderBy(asc(statusHistory.createdAt));

  const { id, ...publicFields } = g;
  res.json({ success: true, data: { ...publicFields, timeline: history } });
}

/** POST /api/grievances/:id/feedback — only owner, only after resolution */
export async function submitFeedback(req, res) {
  const [g] = await db
    .select()
    .from(grievances)
    .where(and(eq(grievances.id, req.params.id), eq(grievances.userId, req.profile.id)))
    .limit(1);
  if (!g) throw ApiError.notFound("Grievance not found");
  if (g.status !== "RESOLVED") {
    throw ApiError.conflict("Feedback can be submitted only after resolution.");
  }

  const [existing] = await db
    .select({ id: feedback.id })
    .from(feedback)
    .where(eq(feedback.grievanceId, g.id))
    .limit(1);
  if (existing) throw ApiError.conflict("Feedback already submitted for this grievance.");

  const [fb] = await db
    .insert(feedback)
    .values({
      grievanceId: g.id,
      userId: req.profile.id,
      rating: req.body.rating,
      comment: req.body.comment || null,
    })
    .returning();

  res.status(201).json({ success: true, message: "Thank you for your feedback!", data: fb });
}

/** GET /api/grievances/stats/me — citizen dashboard cards */
export async function myStats(req, res) {
  const rows = await db
    .select({ status: grievances.status, n: count() })
    .from(grievances)
    .where(eq(grievances.userId, req.profile.id))
    .groupBy(grievances.status);

  const byStatus = Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
  const total = rows.reduce((s, r) => s + Number(r.n), 0);
  res.json({ success: true, data: { total, byStatus } });
}

export { listGrievances, loadFullGrievance };
