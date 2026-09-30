import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus2, FolderOpen } from "lucide-react";
import { api } from "../../lib/api";
import {
  StatusBadge,
  PriorityBadge,
  EmptyState,
  TableSkeleton,
  ErrorAlert,
  Pagination,
} from "../../components/ui";
import { formatDate, STATUSES, STATUS_LABELS } from "../../lib/constants";

export default function MyGrievances() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState({ page: 1, search: "", status: "" });
  const [searchInput, setSearchInput] = useState("");

  const load = async () => {
    setError("");
    try {
      const params = new URLSearchParams({ page: query.page, limit: 10 });
      if (query.search) params.set("search", query.search);
      if (query.status) params.set("status", query.status);
      const { data: res } = await api.get(`/grievances/my?${params}`);
      setData(res.data);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  useEffect(() => {
    load();
  }, [query]);

  const hasFilters = query.search || query.status;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Grievances</h1>
        <Link to="/submit" className="btn-primary">
          <FilePlus2 className="h-4 w-4" aria-hidden="true" /> New Grievance
        </Link>
      </div>

      <form
        className="card flex flex-col gap-3 p-4 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery({ ...query, page: 1, search: searchInput });
        }}
      >
        <label htmlFor="search" className="sr-only">
          Search my grievances
        </label>
        <input
          id="search"
          className="input flex-1"
          placeholder="Search by subject or reference ID…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <label htmlFor="status" className="sr-only">
          Filter by status
        </label>
        <select
          id="status"
          className="input sm:w-48"
          value={query.status}
          onChange={(e) => setQuery({ ...query, page: 1, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button className="btn-secondary">Search</button>
      </form>

      <ErrorAlert message={error} onRetry={load} />

      <div className="card">
        {data === null ? (
          <TableSkeleton rows={6} />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={hasFilters ? "No grievances match your filters." : "No grievances submitted yet."}
            hint={
              hasFilters
                ? "Try clearing the search or choosing a different status."
                : "Submit your first grievance to see it here."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-3 font-mono text-xs">{g.referenceId}</td>
                      <td className="max-w-[240px] truncate px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {g.subject}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{g.category}</td>
                      <td className="px-5 py-3">
                        <PriorityBadge priority={g.priority} />
                      </td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(g.createdAt)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          to={`/my-grievances/${g.id}`}
                          className="font-medium text-civic-600 hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              pagination={data.pagination}
              onPage={(p) => setQuery({ ...query, page: p })}
            />
          </>
        )}
      </div>
    </div>
  );
}
