import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus2, FolderOpen, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
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
import PageWrapper from "../../components/PageWrapper";

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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <PageWrapper>
      <div className="space-y-8">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Grievances
            </h1>
            <p className="mt-1 text-slate-500">Track and manage your submitted grievances.</p>
          </div>
          <Link to="/submit" className="btn bg-civic-600 text-white hover:bg-civic-700 px-5 py-2.5 rounded-xl shadow-lg shadow-civic-600/20 hover:shadow-civic-600/40 transition-all hover:-translate-y-0.5 whitespace-nowrap self-start sm:self-auto">
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold">New Grievance</span>
          </Link>
        </motion.div>

        <motion.form
          variants={itemVariants}
          className="glass-panel p-4 rounded-2xl border border-white/40 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery({ ...query, page: 1, search: searchInput });
          }}
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <label htmlFor="search" className="sr-only">
              Search my grievances
            </label>
            <input
              id="search"
              className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-civic-500 focus:border-civic-500 transition-all dark:text-white"
              placeholder="Search by subject or reference ID…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <div className="relative sm:w-56 shrink-0">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <label htmlFor="status" className="sr-only">
              Filter by status
            </label>
            <select
              id="status"
              className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-civic-500 focus:border-civic-500 transition-all dark:text-white appearance-none"
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
          </div>
          <button className="btn bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 px-6 py-2.5 rounded-xl font-semibold transition-all">Search</button>
        </motion.form>

        <ErrorAlert message={error} onRetry={load} />

        <motion.div variants={itemVariants} className="glass-panel rounded-2xl border border-white/40 dark:border-slate-800/60 shadow-xl overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl">
          {data === null ? (
            <div className="p-6">
               <TableSkeleton rows={6} />
            </div>
          ) : data.items.length === 0 ? (
            <div className="p-12">
               <EmptyState
                icon={FolderOpen}
                title={hasFilters ? "No grievances match your filters." : "No grievances submitted yet."}
                hint={
                  hasFilters
                    ? "Try clearing the search or choosing a different status."
                    : "Submit your first grievance to see it here."
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200/60 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold dark:border-slate-700/60 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                    {data.items.map((g) => (
                      <tr
                        key={g.id}
                        className="transition-colors hover:bg-white/60 dark:hover:bg-slate-800/60 group"
                      >
                        <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-civic-600 dark:group-hover:text-civic-400 transition-colors">{g.referenceId}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          <div className="max-w-[200px] sm:max-w-[300px] truncate">
                            {g.subject}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{g.category}</td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={g.priority} />
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(g.createdAt)}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={g.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/my-grievances/${g.id}`}
                            className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold text-civic-600 hover:bg-civic-50 hover:text-civic-700 dark:text-civic-400 dark:hover:bg-civic-900/30 transition-all"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30">
                <Pagination
                  pagination={data.pagination}
                  onPage={(p) => setQuery({ ...query, page: p })}
                />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
