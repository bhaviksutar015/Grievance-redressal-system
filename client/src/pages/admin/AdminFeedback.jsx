import { useEffect, useState } from "react";
import { Star, MessageSquareHeart } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { api } from "../../lib/api";
import { EmptyState, ErrorAlert, TableSkeleton } from "../../components/ui";
import { formatDate } from "../../lib/constants";

export default function AdminFeedback() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const { data: res } = await api.get("/admin/feedback");
      setData(res.data);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dist = [1, 2, 3, 4, 5].map((r) => ({
    rating: `${r}★`,
    count: data?.distribution.find((d) => d.rating === r)?.count ?? 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Citizen Feedback</h1>
      <ErrorAlert message={error} onRetry={load} />

      {data === null && !error ? (
        <div className="card"><TableSkeleton rows={5} /></div>
      ) : data && data.items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={MessageSquareHeart}
            title="No feedback available."
            hint="Citizens can rate a grievance after it is resolved."
          />
        </div>
      ) : (
        data && (
          <>
            <section className="card p-5">
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Rating Distribution
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dist}>
                    <XAxis dataKey="rating" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card">
              <h2 className="border-b border-slate-200 px-5 py-4 font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
                Recent Feedback
              </h2>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.items.map((f) => (
                  <li key={f.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xs text-civic-600 dark:text-civic-400">
                        {f.referenceId}
                      </p>
                      <div className="flex items-center gap-0.5" aria-label={`${f.rating} of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${n <= f.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                      {f.subject}
                    </p>
                    {f.comment && (
                      <p className="mt-1 text-sm text-slate-500">"{f.comment}"</p>
                    )}
                    <time className="mt-1 block text-xs text-slate-400">
                      {formatDate(f.createdAt, true)}
                    </time>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )
      )}
    </div>
  );
}
