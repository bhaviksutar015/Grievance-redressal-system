import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip, Star, Download, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import {
  StatusBadge,
  PriorityBadge,
  ErrorAlert,
  SuccessAlert,
  Spinner,
  Field,
} from "../../components/ui";
import Timeline from "../../components/Timeline";
import { formatDate } from "../../lib/constants";
import PageWrapper from "../../components/PageWrapper";

export default function GrievanceDetail() {
  const { id } = useParams();
  const [g, setG] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [info, setInfo] = useState("");
  const [infoBusy, setInfoBusy] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [fbBusy, setFbBusy] = useState(false);

  const load = async () => {
    setError("");
    try {
      const { data } = await api.get(`/grievances/${id}`);
      setG(data.data);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const openAttachment = async (att) => {
    try {
      const res = await api.get(`/attachments/${att.id}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  const submitInfo = async (e) => {
    e.preventDefault();
    if (info.trim().length < 5 || infoBusy) return;
    setInfoBusy(true);
    setNotice("");
    try {
      await api.put(`/grievances/${id}`, { additionalInfo: info.trim() });
      setInfo("");
      setNotice("Additional information added.");
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setInfoBusy(false);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!rating || fbBusy) return;
    setFbBusy(true);
    setNotice("");
    try {
      await api.post(`/grievances/${id}/feedback`, {
        rating,
        comment: comment.trim(),
      });
      setNotice("Thank you for your feedback!");
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setFbBusy(false);
    }
  };

  if (!g && !error) return <Spinner label="Loading grievance…" />;

  const isOpen = g && !["RESOLVED", "REJECTED"].includes(g.status);

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl space-y-6">
        <motion.div variants={itemVariants}>
          <Link
            to="/my-grievances"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-civic-600 dark:hover:text-civic-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to My Grievances
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ErrorAlert message={error} />
          <SuccessAlert message={notice} />
        </motion.div>

        {g && (
          <>
            <motion.div variants={itemVariants} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-800/60 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-civic-400/10 dark:bg-civic-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-sm font-semibold tracking-wider text-civic-600 dark:text-civic-400 uppercase">
                    Ref: {g.referenceId}
                  </p>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {g.subject}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <PriorityBadge priority={g.priority} />
                  <StatusBadge status={g.status} />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200/60 dark:border-slate-700/60 relative z-10">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                  <div className="glass-panel bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/50 dark:border-slate-700/50">
                    <dt className="text-slate-500 dark:text-slate-400 font-medium mb-1">Category</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{g.category}</dd>
                  </div>
                  <div className="glass-panel bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/50 dark:border-slate-700/50">
                    <dt className="text-slate-500 dark:text-slate-400 font-medium mb-1">Department</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{g.department || "—"}</dd>
                  </div>
                  <div className="glass-panel bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/50 dark:border-slate-700/50">
                    <dt className="text-slate-500 dark:text-slate-400 font-medium mb-1">Location</dt>
                    <dd className="font-bold text-slate-900 dark:text-white">{g.location || "—"}</dd>
                  </div>
                  <div className="glass-panel bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/50 dark:border-slate-700/50">
                    <dt className="text-slate-500 dark:text-slate-400 font-medium mb-1">Timeline</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex flex-col gap-1">
                        <span><span className="text-slate-400">Sub:</span> {formatDate(g.createdAt, true)}</span>
                        {g.resolvedAt && (
                          <span className="text-civic-600 dark:text-civic-400"><span className="text-slate-400">Res:</span> {formatDate(g.resolvedAt, true)}</span>
                        )}
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 relative z-10">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                  Description
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                </h2>
                <div className="mt-6 glass-panel bg-white/60 dark:bg-slate-900/60 p-6 rounded-2xl border border-white/50 dark:border-slate-700/50">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                    {g.description}
                  </p>
                </div>
              </div>

              {g.attachments.length > 0 && (
                <div className="mt-8 relative z-10">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                    Attachments
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                  </h2>
                  <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {g.attachments.map((att) => (
                      <li key={att.id}>
                        <button
                          onClick={() => openAttachment(att)}
                          className="flex w-full items-center gap-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 p-4 text-left text-sm text-civic-700 hover:bg-white dark:text-civic-300 dark:hover:bg-slate-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group"
                        >
                          <div className="rounded-lg bg-civic-100 dark:bg-civic-900/50 p-2 text-civic-600 dark:text-civic-400 group-hover:scale-110 transition-transform">
                             <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </div>
                          <span className="flex-1 truncate font-medium">{att.fileName}</span>
                          <Download className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-civic-600 transition-colors" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Timeline with admin remarks */}
            <motion.div variants={itemVariants} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-slate-800/60 shadow-xl overflow-hidden relative mt-6">
              <h2 className="mb-8 text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm shadow-inner">
                  ⏱️
                </span>
                Status Timeline
              </h2>
              <Timeline entries={g.history} />
            </motion.div>

            {/* Add additional info */}
            {isOpen && (
              <motion.form variants={itemVariants} onSubmit={submitInfo} className="glass-panel p-6 sm:p-8 rounded-3xl border border-civic-200/50 dark:border-civic-800/50 bg-civic-50/30 dark:bg-civic-900/10 shadow-xl overflow-hidden relative mt-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-2">
                  <PlusCircle className="h-5 w-5 text-civic-600" aria-hidden="true" />
                  Add Additional Information
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  New facts, updates or clarifications will be appended to your
                  grievance and recorded in its history.
                </p>
                <textarea
                  className="w-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-civic-500 focus:border-civic-500 transition-all dark:text-white min-h-24 shadow-inner resize-y"
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  placeholder="e.g. The problem has now spread to the adjacent lane as well…"
                  aria-label="Additional information"
                />
                <div className="mt-4 flex justify-end">
                  <button className="btn bg-civic-600 text-white hover:bg-civic-700 px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-civic-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" disabled={info.trim().length < 5 || infoBusy}>
                    {infoBusy ? "Saving…" : "Add Information"}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Feedback */}
            {g.status === "RESOLVED" &&
              (g.feedback ? (
                <motion.div variants={itemVariants} className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 shadow-xl overflow-hidden relative mt-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Feedback</h2>
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 w-max px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/50" aria-label={`${g.feedback.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-5 w-5 ${n <= g.feedback.rating ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-slate-300 dark:text-slate-600"}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  {g.feedback.comment && (
                    <div className="mt-4 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-sm italic text-slate-600 dark:text-slate-400">
                        "{g.feedback.comment}"
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.form variants={itemVariants} onSubmit={submitFeedback} className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-200/50 dark:border-amber-900/30 bg-gradient-to-br from-amber-50/30 to-white/10 dark:from-amber-900/10 dark:to-slate-900/10 shadow-xl overflow-hidden relative mt-6 space-y-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-500/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    How was the resolution?
                  </h2>
                  <div className="flex items-center gap-2" role="radiogroup" aria-label="Rating out of 5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        onClick={() => setRating(n)}
                        className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                      >
                        <Star
                          className={`h-8 w-8 transition-all ${n <= rating ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-md" : "text-slate-300 hover:text-amber-300 dark:text-slate-600 dark:hover:text-amber-500 hover:scale-110"}`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                  <Field label="Comment (optional)" htmlFor="fb-comment">
                    <textarea
                      id="fb-comment"
                      className="w-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all dark:text-white min-h-24 shadow-inner resize-y"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience…"
                    />
                  </Field>
                  <button className="btn bg-amber-500 text-white hover:bg-amber-600 px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none w-full sm:w-auto" disabled={!rating || fbBusy}>
                    {fbBusy ? "Submitting…" : "Submit Feedback"}
                  </button>
                </motion.form>
              ))}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
