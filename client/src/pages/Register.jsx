import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Landmark } from "lucide-react";
import { authClient } from "../lib/authClient";
import { clearTokenCache } from "../lib/api";
import { ErrorAlert, Field } from "../components/ui";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [fieldErr, setFieldErr] = useState({});
  const [loading, setLoading] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      navigate("/dashboard", { replace: true });
    }
  }, [session?.user, navigate]);

  const validate = () => {
    const fe = {};
    if (form.name.trim().length < 2) fe.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) fe.email = "Enter a valid email address.";
    if (form.password.length < 8) fe.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) fe.confirm = "Passwords do not match.";
    setFieldErr(fe);
    return Object.keys(fe).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await authClient.signUp.email({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (authError) {
        setError(authError.message || "Registration failed. Try a different email.");
        return;
      }
      clearTokenCache();
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-6 text-center">
        <span className="inline-flex rounded-2xl bg-civic-600 p-3 text-white">
          <Landmark className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Create your citizen account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Free registration — your password is managed by Neon Auth and never
          stored by this application.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
        <ErrorAlert message={error} />
        <Field label="Full Name" htmlFor="name" required error={fieldErr.name}>
          <input
            id="name"
            className="input"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Priya Sharma"
          />
        </Field>
        <Field label="Email" htmlFor="email" required error={fieldErr.email}>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          required
          error={fieldErr.password}
          hint="At least 8 characters."
        >
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Field label="Confirm Password" htmlFor="confirm" required error={fieldErr.confirm}>
          <input
            id="confirm"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {loading ? "Creating account…" : "Register"}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-civic-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
