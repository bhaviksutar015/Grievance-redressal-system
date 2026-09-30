import { and, asc, avg, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db, schema } from "../db/client.js";
import { ApiError } from "../utils/apiError.js";
import { notifyStatus, notifyCustom } from "../services/notificationService.js";
import { listGrievances, loadFullGrievance } from "./grievanceController.js";
import { toCsv } from "../utils/csv.js";

const { grievances, categories, statusHistory, profiles, feedback } = schema;

/** GET /api/admin/grievances — all grievances with filters/search/pagination */
export async function allGrievances(req, res) {
  const result = await listGrievances(req.validatedQuery);
  res.json({ success: true, data: result });
}

/** GET /api/admin/grievances/:id — full detail incl. citizen contact info */
export async function adminGrievanceDetail(req, res) {
  const g = await loadFullGrievance(req.params.id);
  if (!g) throw ApiError.notFound("Grievance not found");

  const [citizen] = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      email: profiles.email,
      mobile: profiles.mobile,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.id, g.userId))
    .limit(1);

  res.json({ success: true, data: { ...g, citizen } });
}

const ALLOWED_TRANSITIONS = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["ASSIGNED", "IN_PROGRESS", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED: [],
  REJECTED: [],
};

/** PUT /api/admin/grievances/:id/status — transactional with history record */
export async function updateStatus(req, res) {
  const { status, remark, department } = req.body;

  const [g] = await db
    .select()
    .from(grievances)
    .where(eq(grievances.id, req.params.id))
    .limit(1);
  if (!g) throw ApiError.notFound("Grievance not found");

  if (g.status === status) {
    throw ApiError.conflict(`Grievance is already in ${status} state.`);
  }
  if (!ALLOWED_TRANSITIONS[g.status]?.includes(status)) {
    throw ApiError.badRequest(
      `Invalid transition: ${g.status} → ${status}. Allowed: ${
        ALLOWED_TRANSITIONS[g.status]?.join(", ") || "none (closed)"
      }`
    );
  }
  if (status === "REJECTED" && !remark) {
    throw ApiError.badRequest("A reason (remark) is required when rejecting.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(schema.grievances)
      .set({
        status,
        department: department || g.department,
        assignedTo: status === "ASSIGNED" ? req.profile.id : g.assignedTo,
        resolvedAt: status === "RESOLVED" ? new Date() : g.resolvedAt,
        updatedAt: new Date(),
      })
      .where(eq(schema.grievances.id, g.id));

    await tx.insert(schema.statusHistory).values({
      grievanceId: g.id,
      status,
      remark: remark || null,
      updatedBy: req.profile.id,
    });

    await notifyStatus(tx, {
      userId: g.userId,
      grievanceId: g.id,
      referenceId: g.referenceId,
      status,
    });
  });

  res.json({ success: true, message: `Status updated to ${status.replace("_", " ")}.` });
}

/** POST /api/admin/grievances/:id/remarks — remark without status change */
export async function addRemark(req, res) {
  const [g] = await db
    .select()
    .from(grievances)
    .where(eq(grievances.id, req.params.id))
    .limit(1);
  if (!g) throw ApiError.notFound("Grievance not found");

  await db.transaction(async (tx) => {
    await tx.insert(schema.statusHistory).values({
      grievanceId: g.id,
      status: g.status,
      remark: req.body.remark,
      updatedBy: req.profile.id,
    });
    await tx
      .update(schema.grievances)
      .set({ updatedAt: new Date() })
      .where(eq(schema.grievances.id, g.id));
    await notifyCustom(tx, {
      userId: g.userId,
      grievanceId: g.id,
      title: "New remark on your grievance",
      message: `An official remark was added to ${g.referenceId}: "${req.body.remark.slice(0, 140)}"`,
    });
  });

  res.status(201).json({ success: true, message: "Remark added." });
}

/** GET /api/admin/dashboard — real aggregate analytics */
export async function dashboard(_req, res) {
  const [byStatusRows, byCategoryRows, monthlyRows, [totals], [resTime], ratingRows] =
    await Promise.all([
      db
        .select({ status: grievances.status, n: count() })
        .from(grievances)
        .groupBy(grievances.status),
      db
        .select({ category: categories.name, n: count(grievances.id) })
        .from(categories)
        .leftJoin(grievances, eq(grievances.categoryId, categories.id))
        .groupBy(categories.name)
        .orderBy(desc(count(grievances.id))),
      db
        .select({
          month: sql`to_char(date_trunc('month', ${grievances.createdAt}), 'YYYY-MM')`,
          n: count(),
        })
        .from(grievances)
        .where(gte(grievances.createdAt, sql`now() - interval '11 months'`))
        .groupBy(sql`1`)
        .orderBy(sql`1`),
      db.select({ total: count() }).from(grievances),
      db
        .select({
          avgHours: sql`round(avg(extract(epoch from (${grievances.resolvedAt} - ${grievances.createdAt})) / 3600)::numeric, 1)`,
        })
        .from(grievances)
        .where(isNotNull(grievances.resolvedAt)),
      db
        .select({ avgRating: avg(feedback.rating), n: count() })
        .from(feedback),
    ]);

  const byStatus = Object.fromEntries(byStatusRows.map((r) => [r.status, Number(r.n)]));
  const total = Number(totals.total);
  const resolved = byStatus.RESOLVED ?? 0;

  res.json({
    success: true,
    data: {
      total,
      byStatus,
      resolvedPercentage: total ? Math.round((resolved / total) * 100) : 0,
      pending: total - resolved - (byStatus.REJECTED ?? 0),
      byCategory: byCategoryRows.map((r) => ({ category: r.category, count: Number(r.n) })),
      monthly: monthlyRows.map((r) => ({ month: r.month, count: Number(r.n) })),
      avgResolutionHours: resTime?.avgHours ? Number(resTime.avgHours) : null,
      feedback: {
        count: Number(ratingRows[0]?.n ?? 0),
        avgRating: ratingRows[0]?.avgRating
          ? Number(Number(ratingRows[0].avgRating).toFixed(2))
          : null,
      },
    },
  });
}

/** GET /api/admin/export — CSV export (no unnecessary private data) */
export async function exportCsv(req, res) {
  const q = req.validatedQuery;
  const rows = await db
    .select({
      referenceId: grievances.referenceId,
      category: categories.name,
      subject: grievances.subject,
      status: grievances.status,
      priority: grievances.priority,
      department: grievances.department,
      createdAt: grievances.createdAt,
      resolvedAt: grievances.resolvedAt,
    })
    .from(grievances)
    .innerJoin(categories, eq(grievances.categoryId, categories.id))
    .where(q.status ? eq(grievances.status, q.status) : undefined)
    .orderBy(desc(grievances.createdAt))
    .limit(5000);

  const csv = toCsv(rows, [
    ["Reference ID", "referenceId"],
    ["Category", "category"],
    ["Subject", "subject"],
    ["Status", "status"],
    ["Priority", "priority"],
    ["Department", "department"],
    ["Created Date", (r) => r.createdAt?.toISOString() ?? ""],
    ["Resolved Date", (r) => r.resolvedAt?.toISOString() ?? ""],
  ]);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="ogrsa-grievances-${new Date().toISOString().slice(0, 10)}.csv"`
  );
  res.send(csv);
}

/** GET /api/admin/feedback — feedback list + stats */
export async function feedbackStats(_req, res) {
  const [rows, distRows] = await Promise.all([
    db
      .select({
        id: feedback.id,
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
        referenceId: grievances.referenceId,
        subject: grievances.subject,
      })
      .from(feedback)
      .innerJoin(grievances, eq(feedback.grievanceId, grievances.id))
      .orderBy(desc(feedback.createdAt))
      .limit(100),
    db
      .select({ rating: feedback.rating, n: count() })
      .from(feedback)
      .groupBy(feedback.rating)
      .orderBy(asc(feedback.rating)),
  ]);

  res.json({
    success: true,
    data: {
      items: rows,
      distribution: distRows.map((r) => ({ rating: r.rating, count: Number(r.n) })),
    },
  });
}
