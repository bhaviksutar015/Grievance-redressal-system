import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send, Copy, CheckCircle2, Paperclip, X } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ErrorAlert, Field } from "../../components/ui";
import { PRIORITIES, formatDate } from "../../lib/constants";
import PageWrapper from "../../components/PageWrapper";
import { motion } from "framer-motion";

const MAX_FILE = 5 * 1024 * 1024;
const OK_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function SubmitGrievance() {
  const { profile, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    subject: "",
    description: "",
    location: "",
    department: "",
    priority: "MEDIUM",
    mobile: profile?.mobile ?? "",
  });
  const [files, setFiles] = useState([]);
  const [fieldErr, setFieldErr] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data.data))
      .catch(() => setError("Could not load categories. Please refresh."));
  }, []);

  useEffect(() => {
    if (profile?.mobile && !form.mobile) setForm((f) => ({ ...f, mobile: profile.mobile }));
  }, [profile]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addFiles = (e) => {
    const chosen = Array.from(e.target.files ?? []);
    const errs = [];
    const valid = chosen.filter((f) => {
      if (!OK_TYPES.includes(f.type)) {
        errs.push(`${f.name}: only PDF, JPG or PNG allowed`);
        return false;
      }
      if (f.size > MAX_FILE) {
        errs.push(`${f.name}: larger than 5 MB`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...valid].slice(0, 3));
    setFieldErr((fe) => ({ ...fe, files: errs.join("; ") || undefined }));
    if (fileInput.current) fileInput.current.value = "";
  };

  const validate = () => {
    const fe = {};
    if (!form.categoryId) fe.categoryId = "Please choose a category.";
    if (form.subject.trim().length < 5) fe.subject = "Subject must be at least 5 characters.";
    if (form.subject.trim().length > 200) fe.subject = "Subject must be under 200 characters.";
    if (form.description.trim().length < 20)
      fe.description = "Please describe the issue in at least 20 characters.";
    if (form.mobile && !/^[0-9+\-\s]{10,15}$/.test(form.mobile))
      fe.mobile = "Enter a valid mobile number (10–15 digits).";
    setFieldErr(fe);
    return Object.keys(fe).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("attachments", f));
      const { data } = await api.post("/grievances", fd);
      setSuccess(data.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.friendlyMessage);
      if (err.fieldErrors) {
        setFieldErr(
          Object.fromEntries(err.fieldErrors.map((e2) => [e2.field, e2.message]))
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(success.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (success) {
    return (
      <PageWrapper className="mx-auto max-w-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="card p-8 sm:p-10 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-2xl shadow-civic-900/5 dark:shadow-civic-900/30"
        >
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex rounded-full bg-emerald-100 shadow-inner p-4 text-emerald-600 dark:bg-emerald-900/50"
          >
            <CheckCircle2 className="h-12 w-12" aria-hidden="true" />
          </motion.span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Grievance Submitted
          </h1>
          <p className="mt-2 text-slate-500">Your grievance has been successfully submitted and forwarded to the relevant department.</p>

          <dl className="mt-8 space-y-4 rounded-2xl bg-white/50 border border-slate-100 p-6 text-left text-sm dark:bg-slate-800/40 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500 font-medium">Reference ID</dt>
              <dd className="flex items-center gap-2 font-mono font-bold text-civic-700 dark:text-civic-300">
                {success.referenceId}
                <button
                  onClick={copyRef}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700/50"
                  aria-label="Copy reference ID"
                  title="Copy reference ID"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500 font-medium">Date</dt>
              <dd className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(success.createdAt, true)}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500 font-medium">Status</dt>
              <dd className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Submitted</dd>
            </div>
          </dl>

          <div className="mt-8 rounded-2xl bg-civic-50/50 border border-civic-100/50 p-5 text-left text-sm text-civic-900 dark:bg-civic-900/20 dark:border-civic-800/30 dark:text-civic-200">
            <p className="font-bold flex items-center gap-2">Next steps</p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-civic-800/80 dark:text-civic-300/80">
              <li>An administrator will review your grievance shortly.</li>
              <li>You'll get an in-app notification at every status change.</li>
              <li>Track progress anytime with your reference ID.</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to={`/my-grievances/${success.id}`} className="btn-primary w-full sm:w-auto rounded-xl">
              View Grievance
            </Link>
            <Link to="/my-grievances" className="btn-secondary w-full sm:w-auto rounded-xl bg-white dark:bg-slate-800">
              My Grievances
            </Link>
          </div>
        </motion.div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Submit a Grievance</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Provide clear, factual details — it helps officials act faster.
        </p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={submit} 
        className="card mt-8 space-y-8 p-6 sm:p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-0 shadow-xl shadow-civic-900/5 dark:shadow-civic-900/20" 
        noValidate
      >
        <ErrorAlert message={error} />

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Personal Information
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="p-name">
              <input id="p-name" className="input" value={profile?.name ?? ""} disabled />
            </Field>
            <Field label="Email" htmlFor="p-email">
              <input id="p-email" className="input" value={user?.email ?? ""} disabled />
            </Field>
          </div>
          <Field
            label="Mobile Number"
            htmlFor="mobile"
            error={fieldErr.mobile}
            hint="Used only by officials handling your grievance."
          >
            <input
              id="mobile"
              className="input"
              inputMode="tel"
              placeholder="+91 98765 43210"
              value={form.mobile}
              onChange={set("mobile")}
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Grievance Details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="category" required error={fieldErr.categoryId}>
              <select
                id="category"
                className="input"
                value={form.categoryId}
                onChange={set("categoryId")}
              >
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority" htmlFor="priority">
              <select id="priority" className="input" value={form.priority} onChange={set("priority")}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label="Subject"
            htmlFor="subject"
            required
            error={fieldErr.subject}
            hint={`${form.subject.length}/200 characters`}
          >
            <input
              id="subject"
              className="input"
              maxLength={200}
              placeholder="e.g. No water supply in Ward 12 for five days"
              value={form.subject}
              onChange={set("subject")}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            required
            error={fieldErr.description}
            hint="Minimum 20 characters. Include what, where and since when."
          >
            <textarea
              id="description"
              className="input min-h-32"
              placeholder="Describe the issue in detail…"
              value={form.description}
              onChange={set("description")}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location" htmlFor="location">
              <input
                id="location"
                className="input"
                placeholder="Ward / street / landmark"
                value={form.location}
                onChange={set("location")}
              />
            </Field>
            <Field label="Department (if known)" htmlFor="department">
              <input
                id="department"
                className="input"
                placeholder="e.g. Water Works Department"
                value={form.department}
                onChange={set("department")}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Supporting Documents
          </legend>
          <Field
            label="Attachments"
            htmlFor="attachments"
            error={fieldErr.files}
            hint="PDF, JPG or PNG · max 5 MB each · up to 3 files"
          >
            <input
              ref={fileInput}
              id="attachments"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={addFiles}
              className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-civic-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-civic-700 hover:file:bg-civic-100 dark:file:bg-civic-950 dark:file:text-civic-300"
            />
          </Field>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Paperclip className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">{f.name}</span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="rounded p-1 text-slate-400 hover:text-rose-500"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="btn-primary w-full py-3 shadow-lg shadow-civic-600/20 hover:shadow-civic-600/40 transition-all rounded-xl" 
          disabled={submitting}
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          <span className="font-bold">{submitting ? "Submitting…" : "Submit Grievance"}</span>
        </motion.button>
      </motion.form>
    </PageWrapper>
  );
}
