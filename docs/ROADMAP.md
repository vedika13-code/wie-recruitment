# Roadmap — IEEE WIE Recruitment Portal

Status: Draft v0.2
Companion to [PRD.md](./PRD.md), [ARCHITECTURE.md](./ARCHITECTURE.md), and [DECISIONS.md](./DECISIONS.md).

## How to use this

Each stretch below is a self-contained, demoable slice with concrete deliverables and
acceptance criteria — build it, verify it against its acceptance criteria, then move on.
This is the spec-driven loop: PRD/ARCHITECTURE define *what* and *why*, this roadmap
sequences *when*, and DECISIONS.md records any judgment call made while building a
stretch that isn't already covered. If a stretch surfaces a question not answered in the
PRD's open questions, stop and resolve it there before writing code around a guess.

Stretches are numbered in the intended build order. Visual redesign (Stretch 9) is
deliberately last, per explicit instruction — building it earlier would mean re-doing
styling work against a UI that's still changing functionally.

---

## Stretch 0 — Confirm infra constraints *(parallel, non-blocking)*

Not code — a fact-finding task that can happen alongside Stretch 1.

- Confirm with the college what the hosting actually supports: Node runtime version,
  whether Postgres is provided or needs requesting, whether uploaded files can live on
  local disk or need object storage.
- Decide where the 2026 hardcoded admin allowlist lives (env var vs. checked-in config
  vs. seed script) — see [ARCHITECTURE.md §6](./ARCHITECTURE.md#6-open-infra-questions).

**Deliverable:** answers recorded in ARCHITECTURE.md §6 (replacing the open questions),
or an explicit "still unknown, proceeding with local Postgres + disk storage assumption."

---

## Stretch 1 — Backend scaffold

- New `server/` (or similar) Express app: entry point, env-based config (`DATABASE_URL`,
  `GOOGLE_CLIENT_ID`, session secret, admin allowlist).
- Postgres connection + a migration tool (e.g. `node-pg-migrate` or Prisma) with an
  initial migration creating every table from
  [ARCHITECTURE.md §3](./ARCHITECTURE.md#3-data-model-er-diagram).
- `GET /api/health` returns 200 once DB connection is live.

**Acceptance:** fresh clone → install → migrate → `npm run dev` (or equivalent) starts
the server, connects to Postgres, and `/api/health` responds 200. No frontend changes yet.

---

## Stretch 2 — Real auth + roles

Ref: [PRD §4.1](./PRD.md#41-auth), [ARCHITECTURE.md §2 & §2.1](./ARCHITECTURE.md#2-auth-flow-google-sign-in-domain-restricted).

- `POST /api/auth/google` verifies the Google ID token server-side, checks the college
  email domain, upserts the user, resolves role against the hardcoded 2026 allowlist,
  issues an httpOnly session cookie.
- `GET /api/me` returns the current session's user + role.
- `Login.jsx` replaced with a real Google Sign-In button (Google Identity Services).
- `ProtectedRoute` in `App.js` reads session via `GET /api/me` instead of `localStorage`.
- New route-level guard: anything under `/admin` requires role `admin` or `super_admin`.

**Acceptance:**
- Signing in with an allowlisted email produces an Admin/Super Admin account; any other
  college email produces an Applicant.
- A non-college email is rejected by the *server* (test by calling the API directly, not
  just checking the UI hides the option).
- Reloading the page or opening the app in a different browser on the same account stays
  logged in via the session, not `localStorage`.

**Verified so far:** Google Sign-In button renders and completes a real Google auth flow;
a real (non-college) Google ID token reaches the backend, passes signature/audience
verification, and is correctly rejected for failing the domain check; session cookie →
`/api/me` → role resolution → protected routes → logout all confirmed working (via the
dev-login bypass below, which exercises the identical downstream code path).

**⚠️ Still needs testing:** an actual `@vitstudent.ac.in` account signing in through the
real Google button end-to-end (session created, correct role assigned from the allowlist,
protected pages render). Blocked so far on VIT account access from the machines used
during development (a work-managed Google Workspace blocked it on one machine; Windows
Docker setup friction stalled testing on another). Low risk — the only unverified code
path is Google's token verification *succeeding* a domain check, which is well-tested
library behavior, not custom logic — but close this out for real before considering
recruitment-cycle-critical (i.e. before applicants actually rely on this to sign in).

**Addendum — dev-login bypass:** added `POST /api/auth/dev-login` (skips Google, logs in
as any email/role) plus a matching form on `Login.jsx`, specifically to unblock testing
Stretches 3+ without needing Google access on every machine. Double-gated (`NODE_ENV` +
explicit `ENABLE_DEV_LOGIN` flag) so it can't reach production even if one gate is
forgotten — see [DECISIONS.md](./DECISIONS.md). Not part of the original stretch scope,
but necessary scaffolding for continuing to build/test the rest of the roadmap.

---

## Stretch 3 — Cycle, Domain & Profile persistence

Ref: [PRD §4.2](./PRD.md#42-applicant-facing), [PRD §4.5](./PRD.md#45-multi-cycle-support).

- Seed the "2026" `Cycle` row and the 6 `Domain` rows (name + description +
  `DOMAIN_ASSIGNMENT` head/phone, migrated out of `DomainInfo.jsx`'s hardcoded array).
- `GET/PUT /api/profile` wired to `Profile.jsx`; form gains optional LinkedIn and
  portfolio URL fields alongside the existing (now-optional) GitHub field.
- `Domain.jsx` selection logic changes from single-select to max-2 multi-select; a 3rd
  pick is rejected with a message instead of silently replacing the first.
- `POST /api/applications/domains` persists the choice via `APPLICATION_DOMAIN`.
- `DomainInfo.jsx` reads domain + head data from `GET /api/domains` instead of its
  hardcoded array.

**Acceptance:**
- Profile data persists across logging out and back in (proves it's server-side, not
  `localStorage`).
- Selecting 2 domains works; attempting a 3rd is blocked with a visible message.
- Domain Info page content matches what's in the DB, not the old hardcoded file.

---

## Stretch 4 — Task Q&A + per-domain artifacts

Ref: [PRD §4.2 table](./PRD.md#42-applicant-facing), [ARCHITECTURE.md ER notes](./ARCHITECTURE.md#3-data-model-er-diagram).

- Seed `TASK_QUESTION` rows per domain from the existing `questionsMap` in
  `TaskQuestions.jsx`.
- Seed `DOMAIN_TASK_CONFIG` per the default mapping in the PRD (Technical → code
  link/file, Editorial → blog link, Design → design file upload, others → none) as a
  **starting default** — the admin-editing UI for this comes in Stretch 6, so for now
  it's a seed, not yet changeable in-app.
- Rebuild `TaskQuestions.jsx`: each question renders with its own typed text-answer
  field (Google-Form style), plus a conditional artifact field (file picker or URL input)
  only for domains whose config calls for one.
- Wire `POST /api/tasks/:domain/answers`, `POST /api/tasks/:domain/artifact`,
  `POST /api/tasks/:domain/submit` as **upserts** — re-saving an answer or artifact
  updates the existing row rather than creating a duplicate, so applicants can revise
  freely until the deadline (Stretch 5 adds the actual cutoff enforcement).

**Acceptance:**
- Technical's task page shows the 4 existing questions as individual text fields plus a
  code link/file field; Projects' task page shows only text fields, no artifact field.
- Saving the same domain's answers twice with different text updates the same row (check
  the DB directly), not a second row.
- Submitting persists every answer plus the artifact (if applicable) and advances to the
  next selected domain or to Interview, matching today's `TaskQuestions.jsx` navigation
  logic (remaining domains → next task; none left → Interview).

---

## Stretch 5 — Dashboard + deadline enforcement

Ref: [PRD §3](./PRD.md#3-recruitment-flow-v1), [PRD §4.2](./PRD.md#42-applicant-facing).

**Note:** `Dashboard.jsx`'s `localStorage` reads were already swapped for direct
`getProfile()`/`getDomains()`/`getSelectedDomains()` calls during Stretch 3 — leaving the
old localStorage-based card-lock logic in place would have actually blocked navigation
(clicking a "locked" card is a real no-op, not just a visual state) the moment
`Profile.jsx` stopped writing to `localStorage`. This stretch should **consolidate** those
three separate calls into the single `GET /api/dashboard` below, not treat it as new work.

- `GET /api/dashboard` aggregates profile/domain/task/interview unlock state (replacing
  `Dashboard.jsx`'s direct `localStorage` reads).
- `GET /api/cycles/active` exposes `applicationDeadline`/`taskDeadline`.
- Countdown component on Home/Apply/Dashboard counting down to the application deadline.
- **Server-side enforcement**: `PUT /api/profile`, `POST /api/applications/domains`,
  `POST /api/tasks/:domain/answers`, and `POST /api/tasks/:domain/artifact` all reject
  (409/423) once the relevant deadline has passed — this is a hard cutoff, not just a
  disabled button (see [DECISIONS.md](./DECISIONS.md)).
- Frontend disables the relevant forms once the countdown hits zero, matching the
  server's behavior (so the UI doesn't let someone submit and then get surprised by a
  rejection).

**Acceptance:** Dashboard reflects real state after logging in on a fresh
browser/device. Countdown shows correct remaining time. After the deadline: the UI
disables editing, **and** calling the write endpoints directly (e.g. via curl/Postman)
after the deadline is also rejected by the server — verify both, not just the UI state.

---

## Stretch 6 — Admin core: review applications, submissions & task config

Ref: [PRD §4.3](./PRD.md#43-admin-facing).

- `AdminDashboard.jsx`: list/filter applicants across **all** domains, open an
  applicant's profile + answers + artifact, score/annotate, move to
  shortlisted/rejected.
- Wire `GET /api/admin/applications`, `GET /api/admin/applications/:id`,
  `POST /api/admin/submissions/:id/review`.
- **Task Config screen**: lets an admin turn a domain's work-artifact requirement on/off
  and pick its type (code link, code file, blog link, design file) for the active cycle.
  Wire `GET/PUT /api/admin/domain-task-config/:domain`. This is what makes the Stretch 4
  seed data an editable setting instead of a hardcoded fact.
- Enforce the `/admin` route guard from Stretch 2 actually blocks non-admins, including
  via direct API calls.

**Acceptance:** an Admin account sees applicants from every domain in one place (not
scoped to one domain), can score a submission, and move its status; an Applicant account
hitting `/api/admin/applications` directly gets a 403, not just a hidden nav link.
Changing a domain's task config in the admin screen is reflected the next time an
applicant loads that domain's task page (e.g. turning on a design-file requirement for
Publicity makes the artifact field appear for applicants who haven't submitted yet).

---

## Stretch 7 — Interview scheduling (self-service booking)

Ref: [PRD §4.2 & §4.3](./PRD.md#42-applicant-facing), [ARCHITECTURE.md §2.2](./ARCHITECTURE.md#22-interview-slot-booking-self-service-capacity-protected).

- Admin UI (in `AdminDashboard.jsx`) to create interview slots: date, start/end time,
  meet link, and **capacity**. Admin can see each slot's current booked-count / capacity.
- Wire `GET/POST /api/admin/interview-slots` (with `capacity`).
- `Interview.jsx` rebuilt: once shortlisted, calls `GET /api/interview/slots` and lists
  open slots with remaining capacity; a full slot renders as "Unavailable". Applicant
  picks one and calls `POST /api/interview/slots/:id/book`. After booking, `GET
  /api/interview/booking` shows their confirmed date/time + meet link instead of the list.
- **Capacity check + booking insert must be a single atomic DB transaction** (row lock on
  the slot) — this is the "protection" requirement, preventing two applicants from both
  landing the last open seat in a race. Do not implement this as a separate
  read-then-write in application code.
- Reject a second booking attempt by an applicant who already holds one (409).

**Acceptance:**
- A shortlisted applicant sees a list of open slots with remaining capacity, books one,
  and then sees their confirmed slot + meet link on reload.
- A slot at capacity shows "Unavailable" and rejects a booking attempt with a clear error.
- Fire concurrent booking requests at the last open seat on a slot (e.g. two requests at
  once via a quick script) and confirm only one succeeds — this is the actual test of the
  atomicity requirement, not just clicking the button once yourself.
- A non-shortlisted applicant still sees "locked", not the slot list.

---

## Stretch 8 — Admin management (Super Admin only)

Ref: [PRD §4.4](./PRD.md#44-super-admin-facing), [ARCHITECTURE.md §2.1](./ARCHITECTURE.md#21-admin-role-resolution--management).

- `ManageAdmins.jsx`: add an admin by email, remove an existing one. Only rendered/routed
  for `role === 'super_admin'`.
- Wire `GET/POST/DELETE /api/admin/admins`, enforcing `super_admin` server-side.
- `DELETE` only flips the target user's `role` back down — it must never delete the
  `users` row, since `SUBMISSION.reviewer_notes` and `INTERVIEW_SLOT.created_by` FK to it
  and their history must survive the removal (see [DECISIONS.md](./DECISIONS.md)).

**Acceptance:** a Super Admin adds a new admin by email and it takes effect immediately
(that person gets Admin access on next sign-in/request); a regular Admin calling the
endpoint directly gets 403; a removed admin loses access on their next request, but their
past reviewed submissions and any interview slots they created still display their name
correctly in the Admin Dashboard — confirm this by checking a submission they reviewed
before removal still shows their attribution afterward.

---

## Stretch 9 — Visual redesign *(last, on purpose)*

- Full UI/style pass across every existing page plus the new Admin/Manage Admins pages.
- No functional changes — same routes, same data, same behavior. Use the `/verify` pass
  (or a manual click-through of the full applicant + admin flows) before and after to
  confirm nothing broke functionally during the redesign.

**Acceptance:** every flow in this roadmap still works end-to-end after the redesign;
the only observable difference is visual.

---

## Notes on sequencing

- Stretches 3–5 (Cycle/Domain/Profile → Tasks → Dashboard) build on each other and are
  best done in order; 6–8 (admin-side features) depend on 2–5 having real data to review,
  so they come after, not in parallel.
- Any deviation from this order, or a stretch that turns out to need a decision not
  covered by the PRD, should get logged in [DECISIONS.md](./DECISIONS.md) — that file is
  the running record of *why* the build ended up the way it did, this file is just *when*.
