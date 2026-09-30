import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Landmark } from "lucide-react";
import { authClient } from "../lib/authClient";
import { clearTokenCache } from "../lib/api";
import { ErrorAlert, Field } from "../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await authClient.signIn.email({
        email: form.email.trim(),
        password: form.password,
      });
      if (authError) {
        setError(
          authError.message === "Invalid email or password"
            ? "Invalid email or password. If you haven't created an account in this app yet, please register first."
            : authError.message || "Invalid email or password."
        );
        return;
      }
      clearTokenCache();
      navigate(location.state?.from ?? "/dashboard", { replace: true });
    } catch {
      setError(
        "Could not reach the authentication service. Please check that the app servers are running and try again."
      );
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
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to submit and manage your grievances. Authentication is secured
          by Neon Auth.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
        <ErrorAlert message={error} />
        <Field label="Email" htmlFor="email" required>
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
        <Field label="Password" htmlFor="password" required>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/register" className="font-semibold text-civic-600 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
