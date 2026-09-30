import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { STATUS_LABELS, formatDate } from "../lib/constants";

/**
 * Vertical status timeline.
 * entries: [{ status, remark?, createdAt, updatedByName?, updatedByRole? }]
 * showAuthor: admins see who performed each update.
 */
export default function Timeline({ entries = [], showAuthor = false, showRemarks = true }) {
  if (!entries.length) return null;
  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-slate-200 pl-6 dark:border-slate-700">
      {entries.map((e, i) => {
        const isLast = i === entries.length - 1;
        const Icon =
          e.status === "REJECTED" ? XCircle : isLast ? CheckCircle2 : CheckCircle2;
        const color =
          e.status === "REJECTED"
            ? "text-rose-500"
            : e.status === "RESOLVED"
              ? "text-emerald-500"
              : "text-civic-500";
        return (
          <li key={e.id ?? i} className="relative">
            <span className="absolute -left-[31px] rounded-full bg-white dark:bg-slate-900">
              <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {STATUS_LABELS[e.status] ?? e.status}
              </p>
              <time className="text-xs text-slate-400">
                {formatDate(e.createdAt, true)}
              </time>
            </div>
            {showRemarks && e.remark && (
              <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                {e.remark}
              </p>
            )}
            {showAuthor && e.updatedByName && (
              <p className="mt-1 text-xs text-slate-400">
                by {e.updatedByName} ({e.updatedByRole === "ADMIN" ? "Admin" : "Citizen"})
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
