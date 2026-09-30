import axios from "axios";
import { authClient } from "./authClient";

/**
 * Axios instance for the OGRSA backend.
 * Uses relative /api URLs (Vite dev proxy handles routing to Express) and
 * attaches a short-lived Neon Auth JWT as a Bearer token. The JWT is cached
 * in memory and refreshed automatically before expiry — no long-lived
 * secrets are ever written to localStorage.
 */
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api", timeout: 30000 });

let cached = { token: null, exp: 0 };

function decodeExp(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return (payload.exp ?? 0) * 1000;
  } catch {
    return 0;
  }
}

export async function getAccessToken() {
  const now = Date.now();
  if (cached.token && cached.exp - now > 60_000) return cached.token;
  try {
    const { data } = await authClient.getSession();
    if (data?.session?.token) {
      cached = { token: data.session.token, exp: decodeExp(data.session.token) };
      return cached.token;
    }
  } catch (err) {
    console.error("Failed to get session token:", err);
  }
  cached = { token: null, exp: 0 };
  return null;
}

export function clearTokenCache() {
  cached = { token: null, exp: 0 };
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      (err.code === "ECONNABORTED"
        ? "Request timed out. Please try again."
        : "Network error. Please check your connection.");
    return Promise.reject(
      Object.assign(err, {
        friendlyMessage: message,
        fieldErrors: err.response?.data?.errors ?? null,
        status: err.response?.status ?? 0,
      })
    );
  }
);
