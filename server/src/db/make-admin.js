/**
 * Trusted admin-promotion script (never exposed as an API endpoint).
 *
 * Usage:
 *   npm run db:make-admin -- admin@example.com
 *
 * The account must already exist:
 *   1. Sign up through the app (Neon Auth handles the credentials)
 *   2. Sign in once (this creates the application profile)
 *   3. Run this script to set role = ADMIN on the profile
 */
import { eq } from "drizzle-orm";
import { db, pool, schema } from "./client.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run db:make-admin -- <email>");
  process.exit(1);
}

const [profile] = await db
  .select()
  .from(schema.profiles)
  .where(eq(schema.profiles.email, email))
  .limit(1);

if (!profile) {
  console.error(
    `No application profile found for ${email}.\n` +
      "Make sure the user has signed up AND signed in at least once (or called /api/auth/me)."
  );
  await pool.end();
  process.exit(1);
}

await db
  .update(schema.profiles)
  .set({ role: "ADMIN", updatedAt: new Date() })
  .where(eq(schema.profiles.id, profile.id));

console.log(`✔ ${profile.name} <${email}> is now an ADMIN.`);
await pool.end();
