import { useEffect, useState } from "react";
import { UserRound, Save } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { ErrorAlert, SuccessAlert, Field, Spinner } from "../../components/ui";
import { formatDate } from "../../lib/constants";

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ name: profile.name, mobile: profile.mobile ?? "" });
  }, [profile]);

  if (!profile || !form) return <Spinner label="Loading profile…" />;

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (form.mobile && !/^[0-9+\-\s]{10,15}$/.test(form.mobile)) {
      setError("Enter a valid mobile number (10–15 digits).");
      return;
    }
    setSaving(true);
    try {
      await api.put("/profile", {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
      });
      setNotice("Profile updated.");
      await refreshProfile();
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-civic-100 p-3 text-civic-700 dark:bg-civic-950 dark:text-civic-300">
          <UserRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-slate-500">
            Identity managed by Neon Auth · application profile stored in Neon
            PostgreSQL
          </p>
        </div>
      </div>

      <ErrorAlert message={error} />
      <SuccessAlert message={notice} />

      <form onSubmit={save} className="card space-y-4 p-6">
        <Field label="Full Name" htmlFor="name" required>
          <input
            id="name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Email" htmlFor="email" hint="Managed by Neon Auth — cannot be edited here.">
          <input id="email" className="input" value={user?.email ?? profile.email} disabled />
        </Field>
        <Field label="Mobile Number" htmlFor="mobile">
          <input
            id="mobile"
            className="input"
            inputMode="tel"
            placeholder="+91 98765 43210"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role" htmlFor="role">
            <input
              id="role"
              className="input"
              value={profile.role === "ADMIN" ? "Administrator" : "Citizen"}
              disabled
            />
          </Field>
          <Field label="Member Since" htmlFor="created">
            <input id="created" className="input" value={formatDate(profile.createdAt)} disabled />
          </Field>
        </div>
        <p className="text-xs text-slate-400">Last updated {formatDate(profile.updatedAt, true)}</p>
        <button className="btn-primary" disabled={saving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
