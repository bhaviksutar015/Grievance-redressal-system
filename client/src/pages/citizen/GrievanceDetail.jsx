import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip, Star, Download, PlusCircle } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/my-grievances"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-civic-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to My Grievances
      </Link>

      <ErrorAlert message={error} />
      <SuccessAlert message={notice} />

      {g && (
        <>
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-civic-600 dark:text-civic-400">
                  {g.referenceId}
                </p>
                <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {g.subject}
                </h1>
              </div>
              <div className="flex gap-2">
                <PriorityBadge priority={g.priority} />
                <StatusBadge status={g.status} />
              </div>
            </div>

            <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between sm:block">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-medium">{g.category}</dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-slate-500">Department</dt>
                <dd className="font-medium">{g.department || "—"}</dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-slate-500">Location</dt>
                <dd className="font-medium">{g.location || "—"}</dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="font-medium">{formatDate(g.createdAt, true)}</dd>
              </div>
              {g.resolvedAt && (
                <div className="flex justify-between sm:block">
                  <dt className="text-slate-500">Resolved</dt>
                  <dd className="font-medium">{formatDate(g.resolvedAt, true)}</dd>
                </div>
              )}
            </dl>

            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {g.description}
            </p>

            {g.attachments.length > 0 && (
              <>
                <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Attachments
                </h2>
                <ul className="mt-2 space-y-2">
                  {g.attachments.map((att) => (
                    <li key={att.id}>
                      <button
                        onClick={() => openAttachment(att)}
                        className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-left text-sm text-civic-700 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-civic-300 dark:hover:bg-slate-800"
                      >
                        <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{att.fileName}</span>
                        <Download className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Timeline with admin remarks */}
          <div className="card p-6">
            <h2 className="mb-5 font-semibold text-slate-900 dark:text-white">
              Status Timeline & Official Remarks
            </h2>
            <Timeline entries={g.history} />
          </div>

          {/* Add additional info */}
          {isOpen && (
            <form onSubmit={submitInfo} className="card space-y-3 p-6">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <PlusCircle className="h-5 w-5 text-civic-600" aria-hidden="true" />
                Add Additional Information
              </h2>
              <p className="text-sm text-slate-500">
                New facts, updates or clarifications will be appended to your
                grievance and recorded in its history.
              </p>
              <textarea
                className="input min-h-24"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="e.g. The problem has now spread to the adjacent lane as well…"
                aria-label="Additional information"
              />
              <button className="btn-primary" disabled={info.trim().length < 5 || infoBusy}>
                {infoBusy ? "Saving…" : "Add Information"}
              </button>
            </form>
          )}

          {/* Feedback */}
          {g.status === "RESOLVED" &&
            (g.feedback ? (
              <div className="card p-6">
                <h2 className="font-semibold text-slate-900 dark:text-white">Your Feedback</h2>
                <div className="mt-2 flex items-center gap-1" aria-label={`${g.feedback.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-5 w-5 ${n <= g.feedback.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {g.feedback.comment && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    "{g.feedback.comment}"
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="card space-y-4 p-6">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  How was the resolution?
                </h2>
                <div
                  className="flex items-center gap-1"
                  role="radiogroup"
                  aria-label="Rating out of 5"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onClick={() => setRating(n)}
                      className="p-1"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
                <Field label="Comment (optional)" htmlFor="fb-comment">
                  <textarea
                    id="fb-comment"
                    className="input min-h-20"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience…"
                  />
                </Field>
                <button className="btn-primary" disabled={!rating || fbBusy}>
                  {fbBusy ? "Submitting…" : "Submit Feedback"}
                </button>
              </form>
            ))}
        </>
      )}
    </div>
  );
}
