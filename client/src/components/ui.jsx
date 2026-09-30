import { Inbox, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { STATUS_LABELS, STATUS_STYLES, PRIORITY_STYLES } from "../lib/constants";

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_STYLES[priority] ?? ""}`}
    >
      {priority?.charAt(0) + priority?.slice(1).toLowerCase()}
    </span>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500" role="status">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        <Icon className="h-8 w-8 text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </h3>
      {hint && <p className="max-w-sm text-sm text-slate-500">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorAlert({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline">
          Retry
        </button>
      )}
    </div>
  );
}

export function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
    >
      {message}
    </div>
  );
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
      aria-label="Pagination"
    >
      <p className="text-slate-500">
        Page {page} of {totalPages} · {total} record{total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        <button
          className="btn-secondary px-3 py-1.5"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </button>
        <button
          className="btn-secondary px-3 py-1.5"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export function StatCard({ icon: Icon, label, value, tone = "civic" }) {
  const tones = {
    civic: "bg-civic-100 text-civic-700 dark:bg-civic-950 dark:text-civic-300",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  };
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="card flex items-center gap-4 p-5"
    >
      <div className={`rounded-xl p-3 ${tones[tone]}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
}

export function Field({ label, htmlFor, error, required, children, hint }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="text-rose-500" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
