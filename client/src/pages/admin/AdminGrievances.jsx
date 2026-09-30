import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FilterX, ListChecks } from "lucide-react";
import { api } from "../../lib/api";
import {
  StatusBadge,
  PriorityBadge,
  EmptyState,
  TableSkeleton,
  ErrorAlert,
  Pagination,
} from "../../components/ui";
import {
  formatDate,
  STATUSES,
  STATUS_LABELS,
  PRIORITIES,
} from "../../lib/constants";

const DEFAULT = {
  page: 1,
  search: "",
  status: "",
  categoryId: "",
  priority: "",
  from: "",
  to: "",
  sortBy: "createdAt",
  sortDir: "desc",
};

export default function AdminGrievances() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState(DEFAULT);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    api
      .get("/categories/all")
      .then(({ data: res }) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const load = async () => {
    setError("");
    setData(null);
    try {
      const params = new URLSearchParams({ page: q.page, limit: 10, sortBy: q.sortBy, sortDir: q.sortDir });
      ["search", "status", "categoryId", "priority", "from", "to"].forEach((k) => {
        if (q[k]) params.set(k, q[k]);
      });
      const { data: res } = await api.get(`/admin/grievances?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  useEffect(() => {
    load();
  }, [q]);

  const setFilter = (k, v) => setQ((prev) => ({ ...prev, page: 1, [k]: v }));
  const hasFilters = q.search || q.status || q.categoryId || q.priority || q.from || q.to;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Grievance Management
        </h1>
      </div>

      {/* Filters */}
      <div className="card space-y-3 p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter("search", searchInput);
          }}
        >
          <label htmlFor="a-search" className="sr-only">Search</label>
          <input
            id="a-search"
            className="input flex-1"
            placeholder="Search by reference ID or subject…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn-secondary">Search</button>
          {hasFilters && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearchInput("");
                setQ(DEFAULT);
              }}
            >
              <FilterX className="h-4 w-4" aria-hidden="true" /> Clear
            </button>
          )}
        </form>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <select aria-label="Filter by status" className="input" value={q.status} onChange={(e) => setFilter("status", e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select aria-label="Filter by category" className="input" value={q.categoryId} onChange={(e) => setFilter("categoryId", e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select aria-label="Filter by priority" className="input" value={q.priority} onChange={(e) => setFilter("priority", e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <input aria-label="From date" type="date" className="input" value={q.from} onChange={(e) => setFilter("from", e.target.value)} />
          <input aria-label="To date" type="date" className="input" value={q.to} onChange={(e) => setFilter("to", e.target.value)} />
          <select
            aria-label="Sort"
            className="input"
            value={`${q.sortBy}:${q.sortDir}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split(":");
              setQ((prev) => ({ ...prev, page: 1, sortBy, sortDir }));
            }}
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="updatedAt:desc">Recently updated</option>
            <option value="priority:desc">Priority</option>
            <option value="status:asc">Status</option>
          </select>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={load} />

      <div className="card">
        {data === null && !error ? (
          <TableSkeleton rows={8} />
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title={hasFilters ? "No grievances match your filters." : "No grievances yet."}
            hint={hasFilters ? "Try adjusting or clearing the filters." : "Citizen submissions will appear here."}
          />
        ) : (
          data && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((g) => (
                      <tr
                        key={g.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-3 font-mono text-xs">{g.referenceId}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          {g.subject}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{g.category}</td>
                        <td className="px-4 py-3"><PriorityBadge priority={g.priority} /></td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(g.createdAt)}</td>
                        <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/admin/grievances/${g.id}`}
                            className="font-medium text-civic-600 hover:underline"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={data.pagination} onPage={(p) => setQ((prev) => ({ ...prev, page: p }))} />
            </>
          )
        )}
      </div>
    </div>
  );
}
