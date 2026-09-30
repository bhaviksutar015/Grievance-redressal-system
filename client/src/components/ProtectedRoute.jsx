import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui";

/** Requires a signed-in Neon Auth session. */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session…" />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

/** Requires ADMIN role in the application profile (server-enforced too). */
export function AdminRoute({ children }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading || (user && !profile)) return <Spinner label="Checking permissions…" />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
