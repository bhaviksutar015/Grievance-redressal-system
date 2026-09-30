import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Paperclip,
  Download,
  UserRound,
  MessageSquarePlus,
  RefreshCcw,
  Star,
} from "lucide-react";
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
import { formatDate, ALLOWED_TRANSITIONS, STATUS_LABELS } from "../../lib/constants";

export default function AdminGrievanceDetail() {
  const { id } = useParams();
  const [g, setG] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [statusForm, setStatusForm] = useState({ status: "", remark: "", department: "" });
  const [statusBusy, setStatusBusy] = useState(false);
  const [remark, setRemark] = useState("");
  const [remarkBusy, setRemarkBusy] = useState(false);

  const load = async () => {
    setError("");
    try {
      const { data } = await api.get(`/admin/grievances/${id}`);
      setG(data.data);
      setStatusForm((f) => ({ ...f, department: data.data.department ?? "" }));
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

  const updateStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status || statusBusy) return;
    if (statusForm.status === "REJECTED" && !statusForm.remark.trim()) {
      setError("A reason (remark) is required when rejecting a grievance.");
      return;
    }
    setStatusBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.put(`/admin/grievances/${id}/status`, {
        status: statusForm.status,
        remark: statusForm.remark.trim(),
        department: statusForm.department.trim(),
      });
      setNotice(data.message);
      setStatusForm({ status: "", remark: "", department: statusForm.department });
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setStatusBusy(false);
    }
  };

  const addRemark = async (e) => {
    e.preventDefault();
    if (remark.trim().length < 3 || remarkBusy) return;
    setRemarkBusy(true);
    setError("");
    setNotice("");
    try {
      await api.post(`/admin/grievances/${id}/remarks`, { remark: remark.trim() });
      setNotice("Remark added — the citizen has been notified.");
      setRemark("");
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setRemarkBusy(false);
    }
  };

  if (!g && !error) return <Spinner label="Loading grievance…" />;

  const nextStatuses = g ? (ALLOWED_TRANSITIONS[g.status] ?? []) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/admin/grievances"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-civic-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Grievances
      </Link>

      <ErrorAlert message={error} />
      <SuccessAlert message={notice} />

      {g && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Grievance card */}
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-civic-600 dark:text-civic-400">{g.referenceId}</p>
                  <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{g.subject}</h1>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={g.priority} />
                  <StatusBadge status={g.status} />
                </div>
              </div>
              <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Category</dt><dd className="font-medium">{g.category}</dd></div>
                <div><dt className="text-slate-500">Department</dt><dd className="font-medium">{g.department || "—"}</dd></div>
                <div><dt className="text-slate-500">Location</dt><dd className="font-medium">{g.location || "—"}</dd></div>
                <div><dt className="text-slate-500">Submitted</dt><dd className="font-medium">{formatDate(g.createdAt, true)}</dd></div>
                {g.resolvedAt && (
                  <div><dt className="text-slate-500">Resolved</dt><dd className="font-medium">{formatDate(g.resolvedAt, true)}</dd></div>
                )}
              </dl>
              <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {g.description}
              </p>
              {g.attachments.length > 0 && (
                <>
                  <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">Attachments</h2>
                  <ul className="mt-2 space-y-2">
                    {g.attachments.map((att) => (
                      <li key={att.id}>
                        <button
                          onClick={() => openAttachment(att)}
                          className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-left text-sm text-civic-700 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-civic-300 dark:hover:bg-slate-800"
                        >
                          <Paperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span className="flex-1 truncate">{att.fileName}</span>
                          <span className="text-xs text-slate-400">{(att.fileSize / 1024).toFixed(0)} KB</span>
                          <Download className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Timeline (admin sees who) */}
            <div className="card p-6">
              <h2 className="mb-5 font-semibold text-slate-900 dark:text-white">Status History</h2>
              <Timeline entries={g.history} showAuthor />
            </div>

            {/* Feedback */}
            {g.feedback && (
              <div className="card p-6">
                <h2 className="font-semibold text-slate-900 dark:text-white">Citizen Feedback</h2>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-5 w-5 ${n <= g.feedback.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                {g.feedback.comment && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">"{g.feedback.comment}"</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: citizen info + actions */}
          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <UserRound className="h-4 w-4" aria-hidden="true" /> Citizen
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{g.citizen?.name}</dd></div>
                <div><dt className="text-slate-500">Email</dt><dd className="break-all font-medium">{g.citizen?.email}</dd></div>
                <div><dt className="text-slate-500">Mobile</dt><dd className="font-medium">{g.citizen?.mobile || "—"}</dd></div>
                <div><dt className="text-slate-500">Member since</dt><dd className="font-medium">{formatDate(g.citizen?.createdAt)}</dd></div>
              </dl>
            </div>

            {nextStatuses.length > 0 ? (
              <form onSubmit={updateStatus} className="card space-y-3 p-5">
                <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" /> Update Status
                </h2>
                <Field label="New status" htmlFor="new-status" required>
                  <select
                    id="new-status"
                    className="input"
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  >
                    <option value="">— Select —</option>
                    {nextStatuses.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Assign department" htmlFor="dept">
                  <input
                    id="dept"
                    className="input"
                    placeholder="e.g. Water Works Department"
                    value={statusForm.department}
                    onChange={(e) => setStatusForm({ ...statusForm, department: e.target.value })}
                  />
                </Field>
                <Field
                  label={statusForm.status === "REJECTED" ? "Reason (required)" : "Remark"}
                  htmlFor="status-remark"
                  required={statusForm.status === "REJECTED"}
                >
                  <textarea
                    id="status-remark"
                    className="input min-h-20"
                    value={statusForm.remark}
                    onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })}
                    placeholder="Visible to the citizen in their timeline…"
                  />
                </Field>
                <button className="btn-primary w-full" disabled={!statusForm.status || statusBusy}>
                  {statusBusy ? "Updating…" : "Update Status"}
                </button>
              </form>
            ) : (
              <div className="card p-5 text-sm text-slate-500">
                This grievance is closed ({STATUS_LABELS[g.status]}). No further
                status changes are allowed.
              </div>
            )}

            <form onSubmit={addRemark} className="card space-y-3 p-5">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <MessageSquarePlus className="h-4 w-4" aria-hidden="true" /> Add Remark
              </h2>
              <textarea
                className="input min-h-20"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder='e.g. "Your complaint has been forwarded to the concerned department."'
                aria-label="Remark"
              />
              <button className="btn-secondary w-full" disabled={remark.trim().length < 3 || remarkBusy}>
                {remarkBusy ? "Adding…" : "Add Remark (notifies citizen)"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
