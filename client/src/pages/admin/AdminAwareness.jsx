import { useEffect, useState } from "react";
import { Plus, Pencil, BookOpenText, X, Check } from "lucide-react";
import { api } from "../../lib/api";
import { EmptyState, ErrorAlert, SuccessAlert, TableSkeleton, Field } from "../../components/ui";

const EMPTY = { section: "TIP", title: "", body: "", displayOrder: 0 };

export default function AdminAwareness() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError("");
    try {
      const { data } = await api.get("/awareness/all");
      setRows(data.data);
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3 || form.body.trim().length < 10 || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/awareness", {
        ...form,
        title: form.title.trim(),
        body: form.body.trim(),
        displayOrder: Number(form.displayOrder) || 0,
      });
      setNotice("Awareness content published.");
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      await api.put(`/awareness/${editing.id}`, {
        section: editing.section,
        title: editing.title.trim(),
        body: editing.body.trim(),
        displayOrder: Number(editing.displayOrder) || 0,
        active: editing.active,
      });
      setNotice("Content updated.");
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (r) => {
    try {
      await api.put(`/awareness/${r.id}`, {
        section: r.section,
        title: r.title,
        body: r.body,
        displayOrder: r.displayOrder,
        active: !r.active,
      });
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Awareness Content
        </h1>
        <p className="text-sm text-slate-500">
          Tips and FAQs published here appear live on the public Awareness and
          FAQ pages.
        </p>
      </div>

      <ErrorAlert message={error} />
      <SuccessAlert message={notice} />

      <form onSubmit={create} className="card space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-[140px_1fr_120px]">
          <Field label="Type" htmlFor="aw-section">
            <select
              id="aw-section"
              className="input"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
            >
              <option value="TIP">Tip</option>
              <option value="FAQ">FAQ</option>
            </select>
          </Field>
          <Field label="Title / Question" htmlFor="aw-title" required>
            <input
              id="aw-title"
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Order" htmlFor="aw-order">
            <input
              id="aw-order"
              type="number"
              min="0"
              className="input"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Body / Answer" htmlFor="aw-body" required hint="Minimum 10 characters.">
          <textarea
            id="aw-body"
            className="input min-h-20"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </Field>
        <button
          className="btn-primary"
          disabled={form.title.trim().length < 3 || form.body.trim().length < 10 || busy}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Publish
        </button>
      </form>

      <div className="card">
        {rows === null ? (
          <TableSkeleton rows={5} />
        ) : rows.length === 0 ? (
          <EmptyState icon={BookOpenText} title="No awareness content yet." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <li key={r.id} className="px-5 py-4">
                {editing?.id === r.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        className="input w-28"
                        value={editing.section}
                        onChange={(e) => setEditing({ ...editing, section: e.target.value })}
                        aria-label="Type"
                      >
                        <option value="TIP">Tip</option>
                        <option value="FAQ">FAQ</option>
                      </select>
                      <input
                        className="input flex-1"
                        value={editing.title}
                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        aria-label="Title"
                      />
                      <input
                        type="number"
                        className="input w-20"
                        value={editing.displayOrder}
                        onChange={(e) => setEditing({ ...editing, displayOrder: e.target.value })}
                        aria-label="Order"
                      />
                    </div>
                    <textarea
                      className="input min-h-20 w-full"
                      value={editing.body}
                      onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                      aria-label="Body"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="btn-primary px-3 py-1.5" disabled={busy}>
                        <Check className="h-4 w-4" aria-hidden="true" /> Save
                      </button>
                      <button onClick={() => setEditing(null)} className="btn-secondary px-3 py-1.5">
                        <X className="h-4 w-4" aria-hidden="true" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${r.section === "FAQ" ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>
                          {r.section}
                        </span>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{r.title}</p>
                        {!r.active && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{r.body}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing({ ...r })}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-civic-600 dark:hover:bg-slate-800"
                        aria-label={`Edit ${r.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(r)}
                        className={`text-xs font-semibold ${r.active ? "text-rose-500 hover:underline" : "text-emerald-600 hover:underline"}`}
                      >
                        {r.active ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
