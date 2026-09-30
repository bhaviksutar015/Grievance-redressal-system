import { createRemoteJWKSet, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/client.js";
import { env } from "../config/env.js";
import { ApiError, asyncHandler } from "../utils/apiError.js";

/**
 * Neon Auth (Managed Better Auth) issues short-lived EdDSA JWTs.
 * We validate them against the branch JWKS endpoint that Neon injects
 * (NEON_AUTH_JWKS_URL). Issuer/audience are the Neon Auth host.
 * We NEVER trust user ids coming from the request body/query — identity is
 * derived exclusively from the validated token (`sub` claim).
 */
const jwks = createRemoteJWKSet(new URL(env.neonAuthJwksUrl));
const issuer = new URL(env.neonAuthBaseUrl).origin;

async function verifyToken(req) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized();

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: issuer,
    });
    if (!payload.sub) throw new Error("missing sub");
    return payload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired session. Please sign in again.");
  }
}

/**
 * requireAuth:
 *  1. validates the Neon Auth JWT
 *  2. loads (or lazily creates) the application profile for this auth user
 *  3. attaches { req.authUser, req.profile }
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const payload = await verifyToken(req);
  req.authUser = {
    id: payload.sub,
    email: payload.email ?? null,
    name: payload.name ?? null,
  };

  let [profile] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.authUserId, payload.sub))
    .limit(1);

  if (!profile) {
    // First authenticated request: create the application profile.
    // Role is ALWAYS CITIZEN here — admin promotion only via trusted process.
    const inserted = await db
      .insert(schema.profiles)
      .values({
        authUserId: payload.sub,
        name: payload.name || payload.email || "Citizen",
        email: payload.email || "",
        role: "CITIZEN",
      })
      .onConflictDoNothing({ target: schema.profiles.authUserId })
      .returning();
    profile =
      inserted[0] ??
      (
        await db
          .select()
          .from(schema.profiles)
          .where(eq(schema.profiles.authUserId, payload.sub))
          .limit(1)
      )[0];
  }

  req.profile = profile;
  next();
});

/** requireAdmin: must run after requireAuth. */
export function requireAdmin(req, _res, next) {
  if (req.profile?.role !== "ADMIN") {
    return next(ApiError.forbidden("Admin access required"));
  }
  next();
}
