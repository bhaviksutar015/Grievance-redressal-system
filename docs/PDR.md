# Project Design Report (PDR) Content

## PROJECT TITLE
**Online Grievance Redressal System Awareness (OGRSA)** — an educational
Community Engagement Project (CEP) for BSc IT.

## INTRODUCTION
OGRSA is a full-stack web application with two complementary goals: to create
awareness among citizens about how online grievance redressal systems work, and
to provide a genuinely functional platform where the entire grievance
life-cycle — submission, review, assignment, action, resolution and feedback —
can be experienced hands-on. The system is explicitly labelled as an
educational project and is not affiliated with any government portal.

## BACKGROUND
Governments worldwide operate online grievance platforms (in India, for
example, national and state portals exist for public grievances). Yet a large
section of citizens continues to rely on slow, opaque offline channels, mainly
due to lack of awareness and digital confidence. A CEP is an ideal vehicle to
bridge this gap: it combines community education with a demonstrable technical
artefact.

## PROBLEM STATEMENT
Citizens often do not know (a) that grievances can be filed online, (b) how to
file them effectively, and (c) how to track them to closure. Offline processes
provide no receipt, no visibility and weak accountability. There is a need for
an accessible, transparent, educational platform that demonstrates the complete
digital grievance workflow.

## NEED OF THE PROJECT
1. Awareness: simple, jargon-free education about grievance redressal.
2. Digital literacy: guided experience of a real digital workflow.
3. Transparency: visible status timeline for every complaint.
4. Accountability: recorded history of every administrative action.
5. Participation: encourages citizens to engage with civic processes.

## OBJECTIVES
- Build a working web platform for grievance submission, tracking and management.
- Provide a dedicated awareness section (guides, tips, FAQs).
- Implement secure authentication via a managed identity provider (Neon Auth).
- Enforce strict ownership: a citizen can access only their own grievances.
- Provide administrators with dashboards, workflow tools and analytics.
- Document design, security and testing to academic standards.

## SCOPE
In scope: citizen registration/login, grievance CRUD within the defined
workflow, attachments, public tracking, notifications, feedback, admin
management, categories, awareness content management, analytics, CSV export,
responsive accessible UI with dark mode.
Out of scope: integration with real government departments, email/SMS
delivery, payments, mobile native apps, multilingual UI (future work).

## TARGET USERS
1. **Citizens** — submit and track grievances, receive updates, give feedback.
2. **Administrators** — review, assign, progress, resolve/reject grievances,
   manage categories and awareness content, analyse statistics.

## EXISTING SYSTEM
Traditional offline grievance handling: written applications, physical visits,
register entries; and, where online systems exist, low awareness of their use.

## LIMITATIONS OF EXISTING SYSTEM
- No acknowledgement/reference number in many offline flows
- No progress visibility; repeated follow-up visits required
- Records can be lost; no consolidated history
- No systematic feedback loop or analytics
- Time-bound office hours and travel burden

## PROPOSED SYSTEM
A web application where grievances are filed digitally, receive a unique
reference ID, progress through a defined and enforced status workflow, generate
notifications at every step, and close with citizen feedback. An awareness hub
educates users, and an admin console provides management and analytics.

## ADVANTAGES OF PROPOSED SYSTEM
24×7 availability; instant acknowledgement; transparent timeline; permanent
auditable history; role-based access; analytics for decision-making; privacy-
safe public tracking; educational value.

## FUNCTIONAL REQUIREMENTS
FR1 Citizen registration/login/logout via Neon Auth
FR2 Profile view/update (role immutable to the user)
FR3 Grievance submission with validation and attachments
FR4 Unique reference ID generation (OGRSA-YYYY-NNNNNN)
FR5 Public tracking by reference ID (safe fields only)
FR6 Citizen dashboard with statistics and recent grievances
FR7 Search/filter/pagination of grievances
FR8 Additional-information updates on open grievances
FR9 Admin status transitions with enforced state machine
FR10 Status history recording for every change (transactional)
FR11 Admin remarks visible to citizens
FR12 In-app notifications with read state
FR13 Post-resolution feedback (1–5 rating, unique per grievance)
FR14 Category management (activate/deactivate, no unsafe deletes)
FR15 Awareness content management (tips/FAQs)
FR16 Admin analytics from live aggregate queries
FR17 CSV export without private citizen data

## NON-FUNCTIONAL REQUIREMENTS
- **Security**: managed auth, JWT validation, RBAC, ownership checks, input
  validation, rate limiting, safe errors, upload hardening
- **Usability**: responsive, accessible (labels, focus states, contrast), empty
  and loading states, dark mode
- **Performance**: indexed queries, pagination, serverless Postgres pooling
- **Reliability**: transactions for multi-table writes; consistent error model
- **Maintainability**: layered architecture, migrations, documented APIs
- **Portability**: environment-variable configuration; no hard-coded secrets

## HARDWARE REQUIREMENTS
Development: any machine with 4 GB+ RAM and a modern browser.
Server: Node.js-capable host (1 vCPU / 512 MB+ for demo scale).
Database: Neon Serverless PostgreSQL (cloud-hosted).

## SOFTWARE REQUIREMENTS
Node.js 20+ (22+ for `neon skills`), npm, Neon CLI, modern browser,
Neon account (PostgreSQL + Auth), Git.

## TECHNOLOGY STACK
React 18 + Vite + JavaScript + Tailwind CSS + React Router + Axios + Lucide +
Recharts (frontend); Node.js + Express + Zod + Multer + jose (backend);
Neon Serverless PostgreSQL + Drizzle ORM (data); Neon Auth (identity).

## SYSTEM ARCHITECTURE
Three-tier architecture:
1. **Presentation** — React SPA; talks to Neon Auth directly for identity and
   to the backend for data (Bearer JWT).
2. **Application** — Express REST API; stateless; validates JWTs against the
   Neon Auth JWKS; enforces authorization and business rules.
3. **Data** — Neon PostgreSQL; `neon_auth` schema managed by Neon Auth,
   `public` schema owned by the application via Drizzle migrations.

## MODULE DESCRIPTION
1. **Auth module** — Neon Auth SDK integration, session state, protected routes.
2. **Profile module** — application profile linked to auth identity; roles.
3. **Grievance module** — submission, listing, detail, additional info.
4. **Tracking module** — public, privacy-safe reference-ID lookup.
5. **Workflow module** — admin status machine, transactional history.
6. **Notification module** — event-driven in-app messages, read state.
7. **Feedback module** — post-resolution rating, admin statistics.
8. **Category module** — admin-managed taxonomy with soft deactivation.
9. **Awareness module** — DB-driven tips/FAQs + static educational content.
10. **Analytics/Export module** — aggregate dashboards and CSV export.

## DATABASE DESIGN
Eight normalized application tables (profiles, categories, grievances,
status_history, notifications, feedback, attachments, awareness_content) plus a
reference-ID sequence; UUID primary keys; foreign keys with appropriate
CASCADE/RESTRICT/SET NULL actions; CHECK constraints (rating 1–5, subject ≥ 5,
description ≥ 20 chars, file size ≤ 5 MB); unique constraints
(auth_user_id, reference_id, category name, feedback per grievance); indexes on
all frequent filter columns. See README §11 for the full column listing.

## ER DIAGRAM DESCRIPTION
- PROFILES 1—N GRIEVANCES (submitted_by)
- CATEGORIES 1—N GRIEVANCES
- GRIEVANCES 1—N STATUS_HISTORY; PROFILES 1—N STATUS_HISTORY (updated_by)
- GRIEVANCES 1—N ATTACHMENTS
- PROFILES 1—N NOTIFICATIONS; GRIEVANCES 1—N NOTIFICATIONS
- GRIEVANCES 1—1 FEEDBACK; PROFILES 1—N FEEDBACK
- PROFILES 0..1—N GRIEVANCES (assigned_to)
- External: Neon Auth user (neon_auth schema) 1—1 PROFILES via auth_user_id

## DFD LEVEL 0 DESCRIPTION
External entities **Citizen** and **Admin** interact with the single process
**OGRSA System**, which reads/writes the **Neon PostgreSQL** data store and
delegates identity to the external **Neon Auth** service. Citizen flows:
registration data, grievance details, tracking queries, feedback → system;
acknowledgements, statuses, notifications ← system. Admin flows: status
updates, remarks, category/content changes → system; grievance lists,
analytics, exports ← system.

## DFD LEVEL 1 DESCRIPTION
Processes: 1.0 Authentication (delegated to Neon Auth; JWT issued),
2.0 Profile Management, 3.0 Grievance Submission (validates input, generates
reference ID, stores grievance + attachments + first history entry +
notification in one transaction), 4.0 Tracking (public safe projection),
5.0 Workflow Management (validates transition, updates grievance, appends
history, emits notification — transactional), 6.0 Notification Delivery,
7.0 Feedback Processing, 8.0 Analytics & Export. Data stores: D1 profiles,
D2 grievances, D3 status_history, D4 notifications, D5 feedback, D6 categories,
D7 attachments, D8 awareness_content.

## USE CASE DESCRIPTION
- Citizen: Register, Login, Submit Grievance, Attach Evidence, Track by
  Reference, View Own Grievances, View Detail/Timeline/Remarks, Add
  Information, Receive Notifications, Give Feedback, Manage Profile, Logout.
- Admin: Login, View Dashboard/Analytics, Search & Filter Grievances, Open
  Grievance, Update Status, Add Remark, Assign Department, Reject with Reason,
  Manage Categories, Manage Awareness Content, View Feedback, Export CSV.
- Includes/extends: "Update Status" *includes* "Record History" and "Notify
  Citizen"; "Submit Feedback" *extends* "View Detail" (only when RESOLVED).

## API ARCHITECTURE
REST over JSON under `/api`; resource-oriented routes; consistent envelope
`{ success, message?, data? }`; layered server (routes → middleware →
controllers → services → ORM); Zod schema validation at the boundary;
pagination via `page`/`limit`; filtering via query parameters; multipart for
uploads; CSV streaming for export. Full endpoint table in README §9.

## AUTHENTICATION ARCHITECTURE
Neon Auth (Managed Better Auth) owns credentials, sessions and email flows in
the managed `neon_auth` schema. The SPA uses `@neondatabase/auth` (React
adapter) for sign-up/sign-in/session, then exchanges the session for a
short-lived EdDSA JWT (`authClient.token()`). The API verifies each request's
Bearer token against the branch JWKS (issuer/audience pinned) using `jose`, and
maps `sub` → application profile. The application stores no passwords,
performs no hashing and signs no tokens. Roles are an application concern
stored in `profiles.role` and changeable only by a trusted server-side script.

## SECURITY FEATURES
See README §12 — managed authentication, JWKS-verified JWTs, RBAC, SQL-level
ownership enforcement (IDOR-proof: 404 on foreign resources), Zod validation,
parameterized queries via ORM, upload allow-listing and size caps, Helmet,
CORS allow-list, tiered rate limiting (incl. anti-enumeration on public
tracking), transactional integrity, safe centralized error responses, secrets
only in environment files, privacy-minimized public tracking and CSV export.

## TESTING STRATEGY
- **Automated end-to-end API suite** (49 checks) covering auth, authorization,
  ownership/IDOR, workflow transitions, validation, uploads, notifications,
  feedback, categories, export and escalation prevention (`server/test/api.test.sh`).
- **Manual UI checklist** for responsive design, dark mode, loading/empty/error
  states and accessibility (docs/TESTING.md).
- **Security tests as first-class cases**: cross-citizen access must return
  404/403 with no data; role self-promotion must be impossible.

## EXPECTED OUTCOMES
A demonstrable, secure, fully functional grievance platform; measurable
awareness value (awareness hub + guided workflow); complete academic
documentation; a portfolio-grade full-stack project.

## LIMITATIONS
In-app-only notifications; local-disk uploads in development; single admin
tier; English-only UI; application-generated statistics only (no real
government data — by design).

## FUTURE SCOPE
Email/SMS channels, department-level roles and SLAs, escalation matrix,
multilingual UI, object-storage attachments with signed URLs, PWA, audit-log
viewer, AI-assisted category suggestion.

## CONCLUSION
OGRSA fulfils the CEP mandate on two fronts: socially, it educates citizens on
using online grievance redressal; technically, it demonstrates a complete,
security-conscious full-stack implementation on a modern serverless stack
(React, Express, Neon PostgreSQL, Neon Auth) with transparent, auditable
workflows from submission to feedback.

## REFERENCES
1. Neon documentation — https://neon.com/docs (PostgreSQL, Auth, CLI)
2. Better Auth documentation — https://www.better-auth.com/docs
3. Drizzle ORM documentation — https://orm.drizzle.team
4. Express.js documentation — https://expressjs.com
5. React documentation — https://react.dev
6. Tailwind CSS documentation — https://tailwindcss.com/docs
7. OWASP Top 10 (2021) — https://owasp.org/Top10 (A01 Broken Access Control)
8. Zod documentation — https://zod.dev

> Note: this report makes no claims about specific government departments, does
> not cite government statistics, and does not claim integration with any
> official portal.
