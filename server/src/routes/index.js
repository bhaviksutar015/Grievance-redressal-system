import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import { apiLimiter, sensitiveLimiter, trackLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/apiError.js";
import * as g from "../controllers/grievanceController.js";
import * as a from "../controllers/adminController.js";
import * as m from "../controllers/miscController.js";
import {
  createGrievanceSchema,
  addInfoSchema,
  listQuerySchema,
  updateStatusSchema,
  remarkSchema,
  categorySchema,
  feedbackSchema,
  profileUpdateSchema,
  awarenessSchema,
  uuidParam,
} from "../schemas/index.js";

const r = Router();
r.use(apiLimiter);

/* ------------------------------- public ---------------------------------- */
r.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));
r.get("/stats/public", asyncHandler(m.publicStats));
r.get("/awareness", asyncHandler(m.listAwareness));
r.get("/categories", asyncHandler(m.listCategories));
r.get("/grievances/track/:referenceId", trackLimiter, asyncHandler(g.trackGrievance));

/* -------------------------------- auth ----------------------------------- */
r.get("/auth/me", requireAuth, asyncHandler(m.me));

/* ------------------------------- profile --------------------------------- */
r.get("/profile", requireAuth, asyncHandler(m.getProfile));
r.put(
  "/profile",
  requireAuth,
  validate({ body: profileUpdateSchema }),
  asyncHandler(m.updateProfile)
);

/* ------------------------------ grievances -------------------------------- */
r.post(
  "/grievances",
  requireAuth,
  sensitiveLimiter,
  upload.array("attachments", 3),
  validate({ body: createGrievanceSchema }),
  asyncHandler(g.createGrievance)
);
r.get(
  "/grievances/my",
  requireAuth,
  validate({ query: listQuerySchema }),
  asyncHandler(g.myGrievances)
);
r.get("/grievances/stats/me", requireAuth, asyncHandler(g.myStats));
r.get(
  "/grievances/:id",
  requireAuth,
  validate({ params: uuidParam }),
  asyncHandler(g.getGrievance)
);
r.put(
  "/grievances/:id",
  requireAuth,
  validate({ params: uuidParam, body: addInfoSchema }),
  asyncHandler(g.addAdditionalInfo)
);
r.post(
  "/grievances/:id/feedback",
  requireAuth,
  sensitiveLimiter,
  validate({ params: uuidParam, body: feedbackSchema }),
  asyncHandler(g.submitFeedback)
);

/* ----------------------------- notifications ------------------------------ */
r.get("/notifications", requireAuth, asyncHandler(m.listNotifications));
r.put("/notifications/read-all", requireAuth, asyncHandler(m.markAllNotificationsRead));
r.put(
  "/notifications/:id/read",
  requireAuth,
  validate({ params: uuidParam }),
  asyncHandler(m.markNotificationRead)
);

/* ------------------------------ attachments ------------------------------- */
r.get(
  "/attachments/:id",
  requireAuth,
  validate({ params: uuidParam }),
  asyncHandler(m.downloadAttachment)
);

/* -------------------------------- admin ----------------------------------- */
const admin = Router();
admin.use(requireAuth, requireAdmin);
admin.get("/grievances", validate({ query: listQuerySchema }), asyncHandler(a.allGrievances));
admin.get(
  "/grievances/:id",
  validate({ params: uuidParam }),
  asyncHandler(a.adminGrievanceDetail)
);
admin.put(
  "/grievances/:id/status",
  sensitiveLimiter,
  validate({ params: uuidParam, body: updateStatusSchema }),
  asyncHandler(a.updateStatus)
);
admin.post(
  "/grievances/:id/remarks",
  sensitiveLimiter,
  validate({ params: uuidParam, body: remarkSchema }),
  asyncHandler(a.addRemark)
);
admin.get("/dashboard", asyncHandler(a.dashboard));
admin.get("/export", validate({ query: listQuerySchema }), asyncHandler(a.exportCsv));
admin.get("/feedback", asyncHandler(a.feedbackStats));
r.use("/admin", admin);

/* ------------------------- categories (admin write) ------------------------ */
r.get("/categories/all", requireAuth, requireAdmin, (req, res, next) => {
  req.query = { ...req.query, all: "1" };
  m.listCategories(req, res).catch(next);
});
r.post(
  "/categories",
  requireAuth,
  requireAdmin,
  validate({ body: categorySchema }),
  asyncHandler(m.createCategory)
);
r.put(
  "/categories/:id",
  requireAuth,
  requireAdmin,
  validate({ params: uuidParam, body: categorySchema }),
  asyncHandler(m.updateCategory)
);

/* ------------------------- awareness (admin write) ------------------------- */
r.get("/awareness/all", requireAuth, requireAdmin, (req, res, next) => {
  req.query = { ...req.query, all: "1" };
  m.listAwareness(req, res).catch(next);
});
r.post(
  "/awareness",
  requireAuth,
  requireAdmin,
  validate({ body: awarenessSchema }),
  asyncHandler(m.createAwareness)
);
r.put(
  "/awareness/:id",
  requireAuth,
  requireAdmin,
  validate({ params: uuidParam, body: awarenessSchema }),
  asyncHandler(m.updateAwareness)
);

export default r;
