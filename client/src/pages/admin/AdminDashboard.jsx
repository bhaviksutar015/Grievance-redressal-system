import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Inbox,
  SearchCheck,
  Timer,
  CheckCircle2,
  XCircle,
  Download,
  Star,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { api } from "../../lib/api";
import { StatCard, EmptyState, ErrorAlert, Spinner } from "../../components/ui";
import { STATUS_LABELS, CHART_COLORS } from "../../lib/constants";

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setError("");
    try {
      const { data } = await api.get("/admin/dashboard");
      setD(data.data);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get("/admin/export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ogrsa-grievances-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setExporting(false);
    }
  };

  if (!d && !error) return <Spinner label="Loading analytics…" />;

  const by = d?.byStatus ?? {};
  const statusData = Object.entries(by).map(([k, v]) => ({
    name: STATUS_LABELS[k],
    value: v,
  }));
  const categoryData = (d?.byCategory ?? []).filter((c) => c.count > 0);
  const hasData = (d?.total ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Live analytics from Neon PostgreSQL aggregate queries.
          </p>
        </div>
        <button onClick={exportCsv} className="btn-secondary" disabled={exporting}>
          <Download className="h-4 w-4" aria-hidden="true" />
          {exporting ? "Preparing…" : "Export CSV"}
        </button>
      </div>

      <ErrorAlert message={error} onRetry={load} />

      {d && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={FileText} label="Total" value={d.total} />
            <StatCard icon={Inbox} label="New (Submitted)" value={by.SUBMITTED ?? 0} tone="sky" />
            <StatCard
              icon={SearchCheck}
              label="Under Review"
              value={(by.UNDER_REVIEW ?? 0) + (by.ASSIGNED ?? 0)}
              tone="amber"
            />
            <StatCard icon={Timer} label="In Progress" value={by.IN_PROGRESS ?? 0} tone="violet" />
            <StatCard icon={CheckCircle2} label="Resolved" value={by.RESOLVED ?? 0} tone="emerald" />
            <StatCard icon={XCircle} label="Rejected" value={by.REJECTED ?? 0} tone="rose" />
          </div>

          {/* Resolution stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5 text-center">
              <p className="text-3xl font-extrabold text-emerald-600">{d.resolvedPercentage}%</p>
              <p className="text-sm text-slate-500">Resolution rate</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-extrabold text-civic-600">
                {d.avgResolutionHours !== null ? `${d.avgResolutionHours}h` : "—"}
              </p>
              <p className="text-sm text-slate-500">Avg. resolution time</p>
            </div>
            <div className="card p-5 text-center">
              <p className="flex items-center justify-center gap-1 text-3xl font-extrabold text-amber-500">
                {d.feedback.avgRating ?? "—"}
                {d.feedback.avgRating && <Star className="h-6 w-6 fill-amber-400 text-amber-400" aria-hidden="true" />}
              </p>
              <p className="text-sm text-slate-500">
                Avg. citizen rating ({d.feedback.count} review{d.feedback.count === 1 ? "" : "s"})
              </p>
            </div>
          </div>

          {!hasData ? (
            <div className="card">
              <EmptyState
                icon={BarChart3}
                title="Not enough data for analytics yet."
                hint="Charts will appear automatically once grievances are submitted."
              />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="card p-5">
                <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                  Grievances by Category
                </h2>
                {categoryData.length === 0 ? (
                  <EmptyState title="No category data yet." />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical" margin={{ left: 30 }}>
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#1d5df1" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section className="card p-5">
                <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                  Grievances by Status
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="card p-5 lg:col-span-2">
                <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                  Monthly Grievance Trend (last 12 months)
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={d.monthly}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#1d5df1"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          <div className="text-center">
            <Link to="/admin/grievances" className="btn-primary">
              Manage Grievances
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
