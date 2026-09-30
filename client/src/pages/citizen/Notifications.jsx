import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellOff, CheckCheck, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { EmptyState, ErrorAlert, TableSkeleton } from "../../components/ui";
import { formatDate } from "../../lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";

export default function Notifications() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const { data: res } = await api.get("/notifications");
      setData(res.data);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setData((d) => ({
        unread: Math.max(0, d.unread - 1),
        items: d.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      }));
    } catch {
      /* ignore */
    }
  };

  const markAll = async () => {
    try {
      await api.put("/notifications/read-all");
      setData((d) => ({ unread: 0, items: d.items.map((n) => ({ ...n, isRead: true })) }));
    } catch {
      /* ignore */
    }
  };

  return (
    <PageWrapper className="mx-auto max-w-3xl space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Stay updated on the progress of your grievances.
          </p>
        </div>
        {data?.unread > 0 && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAll} 
            className="flex items-center gap-2 rounded-xl bg-civic-50 px-4 py-2 text-sm font-bold text-civic-600 transition-colors hover:bg-civic-100 dark:bg-civic-900/30 dark:text-civic-400 dark:hover:bg-civic-900/50"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all as read
          </motion.button>
        )}
      </motion.div>

      <ErrorAlert message={error} onRetry={load} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-civic-900/5 dark:shadow-civic-900/20"
      >
        {data === null ? (
          <div className="p-5"><TableSkeleton rows={5} /></div>
        ) : data.items.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Sparkles}
              title="All caught up!"
              hint="Status updates about your grievances will appear here."
            />
          </div>
        ) : (
          <motion.ul 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="divide-y divide-slate-200/50 dark:divide-slate-800/50"
          >
            <AnimatePresence>
              {data.items.map((n) => (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className={`group relative flex gap-4 p-5 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${!n.isRead ? "bg-civic-50/40 dark:bg-civic-900/10" : ""}`}
                >
                  <span
                    className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full shadow-sm transition-all ${!n.isRead ? "bg-civic-500 shadow-civic-500/40" : "bg-transparent"}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-base ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {n.message}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
                      <time className="flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800/60 px-2 py-1">
                        {formatDate(n.createdAt, true)}
                      </time>
                      {n.grievanceId && (
                        <Link
                          to={`/my-grievances/${n.grievanceId}`}
                          className="text-civic-600 transition-colors hover:text-civic-700 hover:underline hover:underline-offset-2 dark:text-civic-400 dark:hover:text-civic-300"
                          onClick={() => !n.isRead && markRead(n.id)}
                        >
                          View grievance
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-700 hover:underline hover:underline-offset-2 dark:hover:text-slate-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </motion.div>
    </PageWrapper>
  );
}
