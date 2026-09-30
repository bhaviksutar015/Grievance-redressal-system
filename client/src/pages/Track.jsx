import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Ticket } from "lucide-react";
import { api } from "../lib/api";
import { StatusBadge, ErrorAlert, Spinner } from "../components/ui";
import Timeline from "../components/Timeline";
import { formatDate } from "../lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

export default function Track() {
  const [params] = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") ?? "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    const value = ref.trim().toUpperCase();
    if (!value) {
      setError("Please enter your reference ID.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.get(`/grievances/track/${encodeURIComponent(value)}`);
      setResult(data.data);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" aria-hidden="true"></div>
      
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24 relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-civic-100 dark:bg-civic-900/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-civic-700 dark:text-civic-300">
            Transparency
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl drop-shadow-sm">
            Track Your Grievance
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            Enter the reference ID you received after submission (e.g.{" "}
            <code className="rounded bg-slate-200/60 px-1.5 py-0.5 text-sm font-bold text-civic-700 dark:bg-slate-800/60 dark:text-civic-400">
              OGRSA-2026-000001
            </code>
            ). No login required — and no personal details are ever shown here.
          </p>
        </motion.header>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={search} 
          className="card mt-8 flex flex-col gap-3 p-3 sm:flex-row border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-civic-900/5 dark:shadow-civic-900/20"
        >
          <label htmlFor="ref" className="sr-only">
            Reference ID
          </label>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
            <input
              id="ref"
              className="w-full rounded-xl border-0 bg-white/50 px-4 py-4 pl-12 text-base font-mono uppercase text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-civic-600 dark:bg-slate-950/50 dark:text-white dark:ring-slate-700 dark:focus:ring-civic-500 transition-all placeholder:text-slate-400"
              placeholder="OGRSA-2026-000001"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button className="btn bg-civic-600 text-white hover:bg-civic-700 px-8 py-4 rounded-xl shadow-lg shadow-civic-600/20 hover:shadow-civic-600/40 transition-all hover:-translate-y-0.5 font-bold text-base" disabled={loading}>
            {loading ? "Searching…" : "Track"}
          </button>
        </motion.form>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <ErrorAlert message={error} />
            </motion.div>
          )}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8">
              <Spinner label="Looking up your grievance…" />
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8 border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-civic-900/10 dark:shadow-civic-900/30 overflow-hidden relative"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-civic-400 to-civic-600"></div>
              
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-mono text-sm font-bold tracking-wide text-civic-600 dark:text-civic-400">
                    <Ticket className="h-4 w-4" aria-hidden="true" />
                    {result.referenceId}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {result.subject}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500">
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {result.category}
                    </span>
                    <span>Submitted {formatDate(result.createdAt)}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>Last updated {formatDate(result.updatedAt)}</span>
                  </div>
                </div>
                <div className="scale-110 origin-top-right">
                  <StatusBadge status={result.status} />
                </div>
              </div>

              <div className="mt-10 mb-6">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
                  Progress Timeline
                </h3>
              </div>
              <Timeline entries={result.timeline} showRemarks={false} />

              <div className="mt-10 rounded-2xl bg-gradient-to-br from-civic-50 to-white dark:from-slate-900 dark:to-slate-950 p-5 border border-civic-100 dark:border-slate-800 shadow-inner">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-civic-700 dark:text-civic-400">Privacy Note:</strong> Public tracking shows only the status timeline. Sign in
                  as the grievance owner to see full details, official remarks and
                  attachments.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </PageWrapper>
  );
}
