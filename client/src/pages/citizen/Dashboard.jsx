import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Inbox,
  SearchCheck,
  Timer,
  CheckCircle2,
  FilePlus2,
  ArrowRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import {
  StatCard,
  StatusBadge,
  PriorityBadge,
  EmptyState,
  TableSkeleton,
  ErrorAlert,
} from "../../components/ui";
import { motion } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";
import { formatDate, STATUS_LABELS, CHART_COLORS } from "../../lib/constants";

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [s, r] = await Promise.all([
        api.get("/grievances/stats/me"),
        api.get("/grievances/my?limit=5"),
      ]);
      setStats(s.data.data);
      setRecent(r.data.data.items);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const by = stats?.byStatus ?? {};
  const chartData = Object.entries(by).map(([k, v]) => ({
    name: STATUS_LABELS[k],
    value: v,
  }));

  return (
    <PageWrapper className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Namaste, {profile?.name}. Here's the status of your grievances.
          </p>
        </div>
        <Link to="/submit" className="btn-primary">
          <FilePlus2 className="h-4 w-4" aria-hidden="true" /> New Grievance
        </Link>
      </div>

      <ErrorAlert message={error} onRetry={load} />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {[
          { icon: FileText, label: "Total Grievances", value: stats?.total ?? "—", tone: undefined },
          { icon: Inbox, label: "Submitted", value: by.SUBMITTED ?? 0, tone: "sky" },
          { icon: SearchCheck, label: "Under Review", value: (by.UNDER_REVIEW ?? 0) + (by.ASSIGNED ?? 0), tone: "amber" },
          { icon: Timer, label: "In Progress", value: by.IN_PROGRESS ?? 0, tone: "violet" },
          { icon: CheckCircle2, label: "Resolved", value: by.RESOLVED ?? 0, tone: "emerald" },
        ].map((item, i) => (
          <motion.div 
            key={item.label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <StatCard icon={item.icon} label={item.label} value={item.value} tone={item.tone} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent grievances */}
        <section className="card lg:col-span-2 overflow-hidden" aria-labelledby="recent-h">
          <div className="flex items-center justify-between border-b border-slate-200/50 bg-slate-50/50 px-6 py-5 dark:border-slate-800/50 dark:bg-slate-900/50">
            <h2 id="recent-h" className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Grievances
            </h2>
            <Link
              to="/my-grievances"
              className="flex items-center gap-1 text-sm font-semibold text-civic-600 hover:text-civic-700"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {recent === null ? (
            <TableSkeleton />
          ) : recent.length === 0 ? (
            <EmptyState
              title="No grievances submitted yet."
              hint="When you submit a grievance it will appear here with its live status."
              action={
                <Link to="/submit" className="btn-primary mt-4">
                  Submit your first grievance
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/30">
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <motion.tbody 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                  className="divide-y divide-slate-100 dark:divide-slate-800/60"
                >
                  {recent.map((g) => (
                    <motion.tr
                      key={g.id}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-civic-600 dark:group-hover:text-civic-400 transition-colors">{g.referenceId}</td>
                      <td className="max-w-[220px] truncate px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {g.subject}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{g.category}</td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(g.createdAt)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link
                            to={`/my-grievances/${g.id}`}
                            className="font-semibold text-civic-600 hover:text-civic-700 hover:underline underline-offset-2"
                          >
                            View
                          </Link>
                          <Link
                            to={`/track?ref=${g.referenceId}`}
                            className="font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline underline-offset-2"
                          >
                            Track
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </section>

        {/* Status chart */}
        <section className="card p-6" aria-labelledby="chart-h">
          <h2 id="chart-h" className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
            Status Overview
          </h2>
          {chartData.length === 0 ? (
            <EmptyState
              title="No data yet"
              hint="Your grievance status distribution will appear here."
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={2}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  );
}
