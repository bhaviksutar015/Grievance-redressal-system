export const STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

export const STATUS_LABELS = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export const STATUS_STYLES = {
  SUBMITTED:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
  UNDER_REVIEW:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  ASSIGNED:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300",
  IN_PROGRESS:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  RESOLVED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  REJECTED:
    "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
};

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const PRIORITY_STYLES = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
  HIGH: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  URGENT: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
};

/** Mirrors the backend transition rules (server remains the authority). */
export const ALLOWED_TRANSITIONS = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["ASSIGNED", "IN_PROGRESS", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED: [],
  REJECTED: [],
};

export const CHART_COLORS = [
  "#1d5df1",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#64748b",
];

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}
