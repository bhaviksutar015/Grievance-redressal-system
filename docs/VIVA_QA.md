# OGRSA — Viva Questions & Answers

### Q1. What is the purpose of your project?
OGRSA (Online Grievance Redressal System Awareness) is a CEP project with two
goals: educate citizens about how online grievance redressal works, and provide
a fully functional platform where the complete workflow — submission, tracking,
administration, resolution and feedback — can be experienced hands-on.

### Q2. Why is this a Community Engagement Project?
It directly serves the community by improving digital literacy and civic
awareness. The Awareness Hub explains what a grievance is, how to file one
effectively, common mistakes and citizen responsibilities — in simple language
targeted at ordinary citizens.

### Q3. Explain your technology stack.
Frontend: React 18 with Vite, JavaScript, Tailwind CSS, React Router, Axios,
Recharts and Lucide icons. Backend: Node.js with Express, Zod for validation,
Multer for uploads, jose for JWT verification. Database: Neon Serverless
PostgreSQL accessed through Drizzle ORM. Authentication: Neon Auth (Managed
Better Auth).

### Q4. What is Neon and why did you use it?
Neon is a serverless PostgreSQL platform. It provides autoscaling Postgres,
database branching, and managed services like Neon Auth. I used it because it
gives production-grade PostgreSQL plus managed authentication without running
my own auth server — with everything configured through the Neon CLI and
`neon.ts`.

### Q5. How does authentication work? Do you store passwords?
No passwords are stored by my application. Neon Auth (Managed Better Auth)
owns sign-up, sign-in, sessions and credentials in its managed `neon_auth`
schema. The React app uses the official `@neondatabase/auth` SDK. For API
calls, the client fetches a short-lived EdDSA JWT from Neon Auth and sends it
as a Bearer token; my Express backend verifies it against Neon's JWKS endpoint
with pinned issuer and audience. I never implemented bcrypt or custom JWT
signing.

### Q6. What is a JWT and how do you validate it?
A JSON Web Token is a signed token carrying claims (here: `sub` = user id,
`email`, `exp`, `iss`, `aud`). Neon Auth signs it with an Ed25519 private key;
my server fetches the corresponding public keys from the JWKS URL and verifies
the signature, expiry, issuer and audience using the `jose` library. Only then
is the request considered authenticated.

### Q7. How do you link Neon Auth users to application data?
Each authenticated user gets one row in my `profiles` table with a unique
`auth_user_id` column storing the JWT `sub`. All application tables reference
`profiles.id`. I never modify Neon Auth's internal tables.

### Q8. What is IDOR and how did you prevent it?
Insecure Direct Object Reference — when changing an ID in a URL exposes
another user's data. Prevention: the backend derives identity only from the
validated JWT and every query is scoped, e.g.
`WHERE id = $1 AND user_id = authenticatedProfileId`. A citizen requesting
another citizen's grievance gets 404 with zero data. This is covered by an
automated test.

### Q9. How are roles handled? Can a user make themselves admin?
No. Roles (`CITIZEN`/`ADMIN`) live in the application `profiles` table,
separate from authentication. The profile-update endpoint ignores any `role`
field (Zod strips unknown keys), and there is no self-promotion API. Admins are
created only by a trusted server-side script (`npm run db:make-admin`). This is
also covered by an automated test.

### Q10. Describe your database schema.
Eight normalized tables: profiles, categories, grievances, status_history,
notifications, feedback, attachments and awareness_content, plus a PostgreSQL
sequence for reference numbers. UUID primary keys, foreign keys with
appropriate cascade rules, CHECK constraints (rating 1–5, minimum text lengths,
5 MB file cap), unique constraints (auth_user_id, reference_id, one feedback
per grievance) and indexes on all frequently filtered columns.

### Q11. Why UUIDs instead of serial integers?
UUIDs are non-guessable, safe to expose in URLs, and merge-friendly. Sequential
integers would let an attacker enumerate resources. For the *public* reference
I still use a human-friendly sequential format (OGRSA-2026-000001), but that
endpoint intentionally returns only non-sensitive fields and is rate-limited.

### Q12. Where do you use database transactions and why?
Wherever multiple tables must change together: grievance creation (grievance +
first history entry + attachments + notification), status updates (grievance +
history + notification) and remarks. Drizzle's `db.transaction` over the Neon
WebSocket driver guarantees atomicity — either all writes commit or none do.

### Q13. What is Drizzle ORM and why use it?
A lightweight TypeScript/JavaScript ORM. It gives type-safe, parameterized
query building (SQL-injection safe), a declarative schema, and drizzle-kit
generates versioned SQL migrations from that schema.

### Q14. Explain your status workflow.
SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED, with REJECTED
possible from any open state (with a mandatory reason). The backend enforces a
transition map, so illegal jumps (e.g. UNDER_REVIEW → RESOLVED directly, or
changing a closed grievance) are rejected with 400. Every change is appended to
`status_history` with the actor and timestamp.

### Q15. How does public tracking protect privacy?
The tracking endpoint returns only reference ID, subject, category, status,
dates and a status-only timeline — never the description, remarks, contact
details or names. It is also rate-limited to hinder reference enumeration.

### Q16. How do notifications work?
They are database rows created inside the same transaction as the event
(submission, status change, remark). The client shows an unread badge (polled
periodically) and supports mark-one/mark-all read. Ownership is enforced —
users can only read/modify their own notifications.

### Q17. How is file upload secured?
Allow-list of MIME types *and* extensions (PDF/JPG/JPEG/PNG), 5 MB size limit,
maximum 3 files, randomized UUID filenames (client names never touch the
filesystem), metadata in PostgreSQL, binaries on disk (dev) with a documented
object-storage strategy for production, and downloads gated by owner-or-admin
authorization.

### Q18. What security measures does the backend implement overall?
JWKS-verified Bearer auth, role and ownership middleware, Zod input validation,
ORM-parameterized queries, Helmet security headers, CORS allow-list, tiered
rate limiting, centralized error handling that hides internals, secrets only in
environment variables, and no sensitive data in public responses or CSV
exports.

### Q19. How does the frontend keep auth state?
The official Neon Auth React adapter provides `useSession()`. An AuthContext
combines the session with the application profile fetched from `/api/auth/me`.
Route guards (`ProtectedRoute`, `AdminRoute`) redirect based on this state. The
short-lived JWT is cached only in memory — no long-lived secrets in
localStorage. (Server-side authorization does not depend on these client
guards.)

### Q20. What happens on first login?
The auth middleware looks up the profile by `auth_user_id`; if none exists it
creates one (name/email from the verified token, role CITIZEN) using an
idempotent insert. This keeps registration entirely on Neon Auth's side.

### Q21. How did you test the application?
A 49-check automated end-to-end bash suite that creates real Neon Auth users
and exercises every endpoint, including negative and security cases (IDOR,
escalation, invalid transitions, bad uploads), plus a manual UI checklist for
responsiveness, dark mode, loading/empty/error states and accessibility. Latest
run: 49/49 passed.

### Q22. Why Vite? Why a dev proxy?
Vite gives fast HMR and modern builds. The dev proxy forwards `/api/*` to
Express so the browser talks to a single origin — avoiding CORS complexity and
keeping backend addresses out of frontend code.

### Q23. How is dark mode implemented?
Tailwind's class strategy. A ThemeContext supports light/dark/system, persists
the choice in localStorage, listens to the OS `prefers-color-scheme` change,
and an inline script applies the class before first paint to avoid flashing.

### Q24. What are reference IDs and why not expose database IDs?
`OGRSA-<year>-<6-digit sequence>` from a PostgreSQL sequence. They're
human-friendly for citizens and avoid leaking internal identifiers; internal
UUIDs are used only where authorization is enforced.

### Q25. What are the limitations and future scope?
Limitations: in-app-only notifications, local-disk uploads in dev, single
admin tier, English-only. Future: email/SMS, department roles and SLAs,
multilingual UI, object storage with signed URLs, PWA, audit viewer.

### Q26. Is this connected to any real government system?
No. It is clearly labelled an educational CEP application throughout the UI
and documentation. No government statistics are displayed — all figures are
generated by the application itself.

### Q27. What happens if two users submit at the exact same time?
Reference IDs come from a PostgreSQL sequence, which is concurrency-safe —
each `nextval` is unique even across parallel transactions. Unique constraints
provide a second line of defence.

### Q28. Why did you keep categories instead of deleting them?
Grievances hold foreign keys to categories. Hard-deleting would orphan history
or require cascading deletes of citizen data. Deactivation preserves referential
integrity while hiding the category from new submissions.
