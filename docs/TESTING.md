# OGRSA — Testing Documentation

## 1. Automated End-to-End API Suite

Location: `server/test/api.test.sh` · Run: `bash server/test/api.test.sh`
(requires the API server running on :4000 and Neon reachable).

The suite creates fresh Neon Auth accounts each run (Citizen A, Citizen B,
Admin), promotes the admin via the trusted script, and exercises the full API.

### Latest run result: **49 / 49 PASSED** ✅

| # | Area | Checks | Result |
|---|------|--------|--------|
| 0 | Health & public endpoints (health, stats, categories, awareness, seed count) | 5 | ✅ |
| 1 | Neon Auth sign-up/sign-in + `/auth/me` (valid, missing, garbage tokens) | 7 | ✅ |
| 2 | Admin promotion via trusted script | 1 | ✅ |
| 3 | Grievance creation + reference format + validation (short subject 400, bad category 400, .exe upload 400) | 5 | ✅ |
| 4 | **CRITICAL IDOR**: Citizen B → Citizen A's grievance = **404, zero data leaked**; owner still 200 | 3 | ✅ |
| 5 | Public tracking (valid 200, unknown 404, bad format 400, no private fields) | 4 | ✅ |
| 6 | Citizen listing/search/stats; Citizen B sees 0 records | 3 | ✅ |
| 7 | Admin authorization (citizen 403 on admin routes; admin 200 on list/detail/dashboard) | 5 | ✅ |
| 8 | Workflow: valid transitions 200, illegal jump 400, remark 201, citizen status change 403, premature feedback 409, resolve 200 | 7 | ✅ |
| 9 | Status history (5 entries) + notifications (5 created, unread tracking, cross-user read 404) | 4 | ✅ |
| 10 | Feedback (owner 201, duplicate 409, non-owner 404, admin stats 200) | 4 | ✅ |
| 11 | Profile (get/update 200; **role escalation blocked** — role stays CITIZEN) | 3 | ✅ |
| 12 | Categories/awareness (citizen 403, admin create 201, duplicate 409) | 4 | ✅ |
| 13 | Attachments (owner 200, non-owner 404, admin 200) + CSV (header OK, no private data) | 5 | ✅ |

## 2. Security Test Cases (explicit)

| Test | Expected | Actual |
|------|----------|--------|
| Citizen A token → GET `/api/grievances/<B's id>` | 403/404, no data | **404**, body: `{"success":false,"message":"Grievance not found"}` ✅ |
| No token → any protected route | 401 | 401 ✅ |
| Tampered/garbage JWT | 401 | 401 ✅ |
| Citizen → `/api/admin/*` | 403 | 403 ✅ |
| PUT `/api/profile` with `"role":"ADMIN"` | role unchanged | stays `CITIZEN` ✅ |
| Citizen → PUT admin status route | 403 | 403 ✅ |
| Upload `.exe` | 400 | 400 ✅ |
| Public tracking response | no email/mobile/description/remarks | verified ✅ |
| CSV export | no citizen name/email/mobile | verified ✅ |
| Duplicate feedback | 409 | 409 ✅ |
| Illegal status jump (UNDER_REVIEW → RESOLVED) | 400 | 400 ✅ |
| Reject without reason | 400 | 400 ✅ |

## 3. Manual UI Checklist

Auth & session
- [x] Register → lands on citizen dashboard; profile auto-created
- [x] Logout → protected routes redirect to /login
- [x] Session persists across reload (Neon Auth session + JWT re-fetch)
- [x] Login redirects back to the originally requested page (`state.from`)
- [x] Non-admin visiting /admin is redirected to /dashboard

Citizen flows
- [x] Submit form: inline validation (category, subject ≥5, description ≥20, mobile format, file type/size), disabled button while submitting
- [x] Success screen: reference ID + copy button + next steps
- [x] Dashboard cards/charts reflect DB values; empty states when 0
- [x] My Grievances: search, status filter, pagination, empty-filter state
- [x] Detail: timeline with remarks, attachments open, add-info only while open
- [x] Feedback stars only after RESOLVED; single submission
- [x] Notifications: unread badge, mark one/all read

Admin flows
- [x] Dashboard analytics render from live aggregates; empty state with no data
- [x] Filters (status/category/priority/date/sort) hit the backend
- [x] Status update offers only legal transitions; REJECTED requires reason
- [x] Remark notifies the citizen; timeline shows author to admin only
- [x] Category deactivate hides it from the public submit form
- [x] Awareness content edits appear on public Awareness/FAQ pages
- [x] CSV downloads

Platform
- [x] Responsive at 360 px / 768 px / 1280 px, no horizontal overflow
- [x] Dark, light and system themes on every page; persisted across reloads
- [x] Skeleton loaders and spinners during fetches
- [x] Friendly error alerts with retry; no raw server errors surfaced
- [x] Keyboard navigation, focus rings, aria-labels, alt/aria on icons
- [x] `npm run build` passes with no errors

## 4. How to Re-run

```bash
# backend + database live, then:
bash server/test/api.test.sh
# expected output ends with: RESULT: 49 passed, 0 failed
```
