import { sql } from "drizzle-orm";

/**
 * Generates public reference ids like OGRSA-2026-000001.
 * Backed by a PostgreSQL sequence (created in the initial migration) so ids
 * are unique and gap-tolerant under concurrency. Raw DB UUIDs are never used
 * as public references.
 */
export async function nextReferenceId(tx) {
  const year = new Date().getFullYear();
  const [row] = await tx.execute(sql`SELECT nextval('grievance_ref_seq') AS n`).then(
    (r) => r.rows ?? r
  );
  const n = Number(row.n);
  return `OGRSA-${year}-${String(n).padStart(6, "0")}`;
}
