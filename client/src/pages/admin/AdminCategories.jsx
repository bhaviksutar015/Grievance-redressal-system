import { useEffect, useState } from "react";
import { Plus, Pencil, Tags, X, Check } from "lucide-react";
import { api } from "../../lib/api";
import { EmptyState, ErrorAlert, SuccessAlert, TableSkeleton, Field } from "../../components/ui";
import { formatDate } from "../../lib/constants";

export default function AdminCategories() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null); // {id, name, description}

  const load = async () => {
    setError("");
    try {
      const { data } = await api.get("/categories/all");
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
    if (form.name.trim().length < 2 || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.post("/categories", {
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setNotice("Category created.");
      setForm({ name: "", description: "" });
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!editing || editing.name.trim().length < 2) return;
    setBusy(true);
    setError("");
    try {
      await api.put(`/categories/${editing.id}`, {
        name: editing.name.trim(),
        description: editing.description?.trim() ?? "",
      });
      setNotice("Category updated.");
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (c) => {
    setError("");
    try {
      await api.put(`/categories/${c.id}`, {
        name: c.name,
        description: c.description ?? "",
        active: !c.active,
      });
      setNotice(`Category ${c.active ? "deactivated" : "activated"}. ${c.active ? "It will no longer appear in the submission form; existing grievances are unaffected." : ""}`);
      await load();
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Category Management</h1>
      <ErrorAlert message={error} />
      <SuccessAlert message={notice} />

      <form onSubmit={create} className="card grid gap-3 p-5 sm:grid-cols-[1fr_2fr_auto]">
        <Field label="Name" htmlFor="cat-name" required>
          <input
            id="cat-name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Street Lighting"
          />
        </Field>
        <Field label="Description" htmlFor="cat-desc">
          <input
            id="cat-desc"
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description shown to admins"
          />
        </Field>
        <div className="flex items-end">
          <button className="btn-primary" disabled={form.name.trim().length < 2 || busy}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Add
          </button>
        </div>
      </form>

      <div className="card">
        {rows === null ? (
          <TableSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState icon={Tags} title="No categories yet." hint="Create the first category above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                    {editing?.id === c.id ? (
                      <>
                        <td className="px-5 py-3">
                          <input
                            className="input"
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            aria-label="Category name"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            className="input"
                            value={editing.description ?? ""}
                            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                            aria-label="Category description"
                          />
                        </td>
                        <td className="px-5 py-3" colSpan={2}></td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950" aria-label="Save">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditing(null)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Cancel">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{c.name}</td>
                        <td className="max-w-[280px] truncate px-5 py-3 text-slate-500">{c.description || "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                            {c.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditing({ id: c.id, name: c.name, description: c.description })}
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-civic-600 dark:hover:bg-slate-800"
                              aria-label={`Edit ${c.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleActive(c)}
                              className={`text-xs font-semibold ${c.active ? "text-rose-500 hover:underline" : "text-emerald-600 hover:underline"}`}
                            >
                              {c.active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">
        Categories with existing grievances are never deleted — deactivate them
        instead to hide them from the submission form.
      </p>
    </div>
  );
}
