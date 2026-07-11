# Technical Decisions Log — IEEE WIE Recruitment Portal

Running log of technical decisions, in the order they were made. Each entry: the decision,
why, and what alternatives were considered. Append new entries at the bottom — don't edit
history, add a new entry that supersedes an old one if a decision changes later.

---

## 2026-07-10 — Backend stack: Node.js + Express + PostgreSQL

**Decision:** Backend is a Node.js + Express REST API, backed by PostgreSQL.

**Why:**
- The data is genuinely relational — users, recruitment cycles, domains, applications,
  and submissions all reference each other with clear foreign keys (see
  [ARCHITECTURE.md §3](./ARCHITECTURE.md#3-data-model-er-diagram)). A relational DB with
  real constraints (foreign keys, not-null, enums for status fields) catches data-integrity
  bugs at write time instead of at review time, which matters once panel members are
  scoring real applicants.
- Same language (JS) as the existing frontend, which lowers the bar for whoever on the
  chapter maintains this after the current maintainer graduates/rotates out.
- No vendor lock-in — since hosting is being handled by the college and the exact platform
  isn't confirmed yet (see [ARCHITECTURE.md §6](./ARCHITECTURE.md#6-open-infra-questions)),
  a plain Node process + Postgres is portable to almost any hosting the college can offer,
  unlike a stack that assumes a specific PaaS or managed service.

**Alternatives considered:**
- *MongoDB* — flexible schema is nice for the "questions per domain" data, but this app
  doesn't actually have not-yet-known-shape data; the schema is fixed and relational. Passed.
- *Firebase (Auth + Firestore)* — would make Google sign-in nearly free and needs no
  server, but hands both auth and data to a third party the college doesn't control, and
  the user confirmed the college is handling hosting themselves — a self-hosted Node+PG
  stack fits that better than a hosted BaaS. Passed.

**Status:** Decided. Revisit only if college hosting can't run a Node process or provision
Postgres (see open infra question).

---

## 2026-07-10 — Auth: Google Sign-In restricted to college email domain

**Decision:** Real authentication is Google OAuth 2.0 (Google Identity Services), with the
backend verifying the ID token server-side and rejecting any account whose email doesn't
end in the college domain (`@vitstudent.ac.in`).

**Why:**
- Requested directly — no password reset flow or credential storage to build/secure.
- The *current* "auth" (`Login.jsx` checking `email.endsWith("@vitstudent.ac.in")` against
  freely-typed text, then writing straight to `localStorage`) isn't authentication at all —
  anyone can type any string ending in that suffix. This must move server-side regardless
  of which auth method was chosen; Google sign-in gets a real identity check "for free" via
  the verified token, rather than needing a separate OTP/email-sending system.

**Alternatives considered:**
- *Email + OTP* — no Google dependency, but requires standing up transactional email
  sending and a code-expiry flow. More to build, no benefit over Google given students
  already have college Google accounts.
- *Email + password* — most backend work (hashing, reset flows, breach exposure) for no
  real upside here.

**Status:** Decided.

---

## 2026-07-10 — Recruitment Cycle is a first-class entity from day one

**Decision:** Every application, submission, and domain-head assignment is scoped to a
`Cycle` record (e.g. "2026"), even though v1 only needs to run one cycle.

**Why:** Confirmed requirement — the portal must be reusable in future years without a
schema rework. Retrofitting a "which year is this" concept onto data that was modeled as
if only one cycle would ever exist is exactly the kind of migration pain worth avoiding by
deciding it now, while the schema doesn't exist yet.

**Alternatives considered:**
- *Model for this cycle only, add `Cycle` later* — rejected; the user explicitly asked for
  multi-year reuse, and adding a cycle scope after data already exists means backfilling
  every existing row.

**Status:** Decided.

---

## 2026-07-10 — Domain Head / Panel role, no separate admin role (yet)

**Decision:** v1 ships with two roles: **Applicant** and **Domain Head / Panel**. No
separate "admin" role (someone who opens/closes cycles, assigns domain heads across the
whole chapter, or publishes results globally) is being built yet.

**Why:** This is what was actually confirmed as in-scope. Building an admin role/UI without
a concrete spec for what it does risks over-building. Cycle creation and domain-head
assignment can be a manual DB operation for now (see
[PRD §4.4](./PRD.md#44-multi-cycle-support)).

**Alternatives considered:** Building a full admin role now — deferred, not rejected;
flagged as an open question in the PRD since some chapter-wide operations (opening a new
cycle) need to be done by *someone*, and it isn't obviously a Domain Head's job.

**Status:** Decided for v1. Revisit before the next recruitment cycle if manual DB
operations prove too painful for whoever runs it.

---

## 2026-07-10 — Domain selection resolved to 2, not 1

**Decision:** Applicants select up to 2 domains. `Domain.jsx`'s current single-select
toggle logic is a bug relative to `Apply.jsx`'s own copy ("Select a maximum of 2 domains"),
not an intentional constraint — it changes to a max-2 multi-select that rejects a 3rd pick
with a message instead of silently swapping the selection.

**Why:** Confirmed directly. Also resolves the schema question flagged in the original
architecture draft (single `domainId` vs. an array) — settled as an `APPLICATION_DOMAIN`
join table, see [ARCHITECTURE.md §3](./ARCHITECTURE.md#3-data-model-er-diagram).

**Alternatives considered:** Keep it at 1 and fix the copy instead — rejected, the user
confirmed 2 is correct.

**Status:** Decided.

---

## 2026-07-10 — Admin role model: Admin + Super Admin, hardcoded 2026 allowlist, in-app succession

**Decision:** Two privileged roles beyond Applicant:
- **Admin** — sees applicants/submissions across *all* domains (not scoped to one domain),
  reviews/scores, manages interview slots.
- **Super Admin** — everything an Admin can do, plus the only role that can add/remove
  other admins, via a "Manage Admins" page.

For the 2026 cycle, the initial Admin/Super Admin emails are a hardcoded allowlist checked
at first sign-in (see [ARCHITECTURE.md §2.1](./ARCHITECTURE.md#21-admin-role-resolution--management)).
From then on, a Super Admin adds next cycle's admins in-app — no more code edits needed for
future handoffs.

**Why:**
- Global (not per-domain) admin access was requested directly ("admin needs access to
  tasks and applications", not "their domain's tasks").
- A flat "any admin can add admins" model was considered and rejected in favor of a
  designated Super Admin tier: one careless or compromised admin account shouldn't be able
  to grant itself or others broader access. A chapter handoff is naturally hierarchical
  (outgoing chair → incoming chair) so a Super Admin tier maps onto how the club actually
  hands off leadership, without adding real complexity.
- The allowlist has to be hardcoded (env var/config, not a DB row) for at least the very
  first admin, since there's no admin yet to have created one through the app — this is
  a one-time bootstrapping problem, not the steady-state mechanism.

**Alternatives considered:**
- *Any admin can add admins* — rejected: no safeguard against privilege creep across
  years; one bad account could add arbitrary others.
- *Per-domain-scoped admins* (a "Domain Head" who only sees their domain) — this was the
  v0.1 assumption, superseded now that global admin access was explicitly requested. May
  be revisited later if the chapter wants to delegate review by domain again.

**Status:** Decided. Supersedes the "Domain Head / Panel, no admin role" entry above.

---

## 2026-07-10 — Task submission becomes structured Q&A + per-domain artifact, not one PDF

**Decision:** `TaskQuestions.jsx`'s "answer everything in one PDF" flow is replaced with a
Google-Form-like page: each question has its own typed text-answer field. Some domains
additionally require a work artifact alongside the answers — a code repo link/file upload
for Technical, a blog post link for Editorial, a design file upload for Design — configured
per domain per cycle (`DOMAIN_TASK_CONFIG`), rather than every domain sharing one PDF
requirement.

**Why:** The single-PDF-for-everything shape in the current prototype was an accidental
narrowing, not a deliberate design choice — different domains genuinely produce different
artifacts (code isn't naturally a PDF; a blog is a URL, not a file at all). Structured
per-question answers are also easier for admins to scan/score than parsing free-form PDFs.

**Alternatives considered:**
- *Keep single PDF upload, just per domain* — simplest to build, but a strict downgrade:
  admins can't easily score individual answers, and it doesn't fit non-file artifacts like
  a blog link at all.
- *Fully freeform artifact upload (any file type, no distinction)* — less structure means
  less ability to validate at submit time (e.g. rejecting a `.zip` where a link was
  expected); the explicit `artifact_type` per domain catches that at the API boundary.

**Status:** Decided. Open question remaining: whether the artifact/answer mapping in
[PRD §4.2](./PRD.md#42-applicant-facing) needs to be admin-editable per cycle, or can stay
a seed-time decision — see [PRD §7](./PRD.md#7-open-questions).

---

## 2026-07-10 — Interview scheduling: in-app slots + meet link, no calendar integration

**Decision:** Admins create interview slots (date, start/end time, meet link) in-app and
assign a shortlisted applicant to one. The applicant's `Interview.jsx` page shows the
assigned slot and link once available. No integration with Google Calendar, Calendly, or
similar.

**Why:** Requested directly ("interview page needs admin access to add day slots and meet
link"). Calendar-integration would add a third-party dependency and OAuth scope beyond
what's needed for a single recruitment cycle's interview round; a simple in-app slot list
is enough for the actual volume of interviews a college chapter runs, and avoids adding an
integration surface to maintain.

**Alternatives considered:**
- *Google Calendar API integration* — real syncing/reminders, but meaningfully more setup
  (service account or delegated OAuth, calendar API quota) for a feature that a plain
  slot-list-plus-link already satisfies. Deferred, not ruled out — worth revisiting if
  interview volume grows enough that manual coordination becomes painful.

**Status:** Decided for v1.

---

## 2026-07-10 — Backend build starts now, not mocked in frontend first

**Decision:** Interview slots, the admin list, and task submissions are wired directly
against the real Node+Postgres backend (already scoped in ARCHITECTURE.md) as they're
built, rather than mocked in `localStorage`/hardcoded JSON first and swapped later.

**Why:** These specific features are inherently multi-user shared state (an interview slot
an admin creates must be visible to the applicant it's assigned to; the admin list must be
the same for everyone) — `localStorage` literally cannot represent that, since it's
per-browser. Mocking them would produce throwaway code with no real path to reuse, unlike
the rest of the app where a `localStorage`→API swap is a clean 1:1 replacement (see the
frontend-changes table in [ARCHITECTURE.md §5](./ARCHITECTURE.md#5-frontend-changes-required)).

**Alternatives considered:**
- *Mock first for faster visible progress, wire backend later* — rejected: the "visible
  progress" would be a UI that doesn't actually work for more than one person, and would
  need to be substantially rebuilt (not just have its data layer swapped) once real
  persistence lands.

**Status:** Decided.

---

## 2026-07-11 — Task answers/artifacts are editable up to the deadline (upsert, not one-shot)

**Decision:** An applicant can save/edit their text answers and work artifact per domain
as many times as they want until the cycle's `task_deadline`. `ANSWER` and `SUBMISSION`
writes are upserts keyed on `(application_id, task_question_id)` and
`(application_id, domain_id)` respectively, not insert-only one-shot submissions.

**Why:** Confirmed directly. Also matches how people actually write task answers — draft,
revise, come back to it — rather than forcing a single final submission with no way to
fix a mistake.

**Alternatives considered:** One-shot submit-then-lock — rejected, explicitly not wanted.

**Status:** Decided.

---

## 2026-07-11 — Deadline countdown is a hard, server-enforced cutoff

**Decision:** Once a cycle's `application_deadline` passes, both the API and the UI block
further edits to profile, domain selection, and task answers/artifacts. The countdown
shown to applicants reflects a real boundary, not just a visual timer.

**Why:** Confirmed directly — "countdown does block." This must be enforced server-side
(a disabled button alone doesn't stop a direct API call after the deadline), consistent
with the general rule that access/permission checks live on the backend
(see [PRD §5](./PRD.md#5-non-functional-requirements)).

**Alternatives considered:** Informational-only countdown, cycle closed manually by an
admin — rejected, explicitly not wanted.

**Status:** Decided.

---

## 2026-07-11 — Per-domain task artifact requirement becomes admin-editable in-app

**Decision:** `DOMAIN_TASK_CONFIG` (whether a domain requires a work artifact, and which
type: code link, code file, blog link, design file, or none) is editable by admins in-app,
per cycle, through the Admin Dashboard — not a hardcoded fact baked into a seed script or
the codebase.

**Why:** Confirmed directly — "needs to be admin editable, they pick if they want it at
all and what type." This also future-proofs the exact default mapping in
[PRD §4.2](./PRD.md#42-applicant-facing) (e.g. Editorial wanting a video link instead of a
blog link next year) without needing a code change or new migration.

**Alternatives considered:** Hardcode per domain, revisit only via a schema change each
year — rejected; contradicts the explicit ask and the broader "reusable across future
years without a rework" goal already established for the rest of the data model.

**Status:** Decided. Supersedes the "seed-time decision, open question" framing in the
original ARCHITECTURE.md draft of `DOMAIN_TASK_CONFIG`.

---

## 2026-07-11 — Interview slots: self-service booking with admin-set capacity, not admin-assigned

**Decision:** Admins create interview slots (date, time, meet link, and a **capacity** —
how many applicants may hold that slot). Shortlisted applicants browse open slots and
**book their own**, first-come-first-served. A slot shows as unavailable once its capacity
is reached. This replaces the earlier draft where an admin manually assigned each
applicant to a slot.

**Why:** Confirmed directly, including the capacity/"show unavailable" requirement, which
only makes sense under self-service booking (an admin manually assigning applicants
wouldn't need an availability display for the applicant). Self-booking also just scales
better — an admin doesn't have to individually place every shortlisted applicant into a
slot by hand.

The capacity check + booking write must be atomic (single DB transaction with a row lock)
to prevent two applicants racing for the same last-open seat — see
[ARCHITECTURE.md §2.2](./ARCHITECTURE.md#22-interview-slot-booking-self-service-capacity-protected).
This is a correctness requirement, not a nice-to-have: without it, a slot could silently
overbook under concurrent requests.

**Alternatives considered:**
- *Admin manually assigns each applicant to a slot* — this was the original draft; dropped
  once the actual requirement (capacity + availability display) turned out to describe
  self-service booking instead.

**Status:** Decided. Supersedes the "admin creates slots and assigns a shortlisted
applicant to one" language in the original PRD/ARCHITECTURE drafts.

---

## 2026-07-11 — Removing an admin retains their history permanently

**Decision:** "Remove admin" (`DELETE /api/admin/admins/:id`) only revokes the `role`
field on that user's row. Their past review scores, reviewer notes, and any interview
slots they created remain exactly as they were, still attributed to them. The user row
itself is never deleted, and nothing is reassigned or anonymized.

**Why:** Confirmed directly ("it all stays"). This is also the only option that doesn't
break referential integrity for free — `SUBMISSION.reviewer_notes` and
`INTERVIEW_SLOT.created_by` both FK to `users`; deleting the row would either cascade-
delete real recruitment history or require nullable FKs and reassignment logic that
wasn't asked for.

**Alternatives considered:**
- *Hard-delete the user row* — rejected, would destroy attribution for past reviews and
  slots, and directly contradicts what was asked.
- *Anonymize past attribution on removal* — not requested; adds complexity for no
  confirmed benefit.

**Status:** Decided.

---

## 2026-07-11 — Prisma 7 requires an explicit driver adapter, not a schema `url`

**Decision:** `npm install prisma` resolved Prisma 7.8.0, which changed how `PrismaClient`
connects to Postgres versus older Prisma versions/tutorials: the `url = env("DATABASE_URL")`
line in `datasource db { ... }` is no longer supported, and `new PrismaClient()` with no
arguments now throws. The working setup is: `DATABASE_URL` lives in `prisma.config.ts`
(used by the CLI for migrations), and `server/src/db.js` constructs the client with an
explicit `@prisma/adapter-pg` driver adapter reading the same `DATABASE_URL` from `.env`:

```js
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

Also: the `generator client` block must use `provider = "prisma-client-js"`, not the new
default `"prisma-client"` — the new default generator emits TypeScript source files, which
a plain CommonJS/JS Express project (no TS build step) can't `require()` directly.

**Why:** Not a preference — this is what actually works with the Prisma version that
installed. Recorded here so a future contributor reading older Prisma docs/tutorials
(which show `url` in the schema and a bare `new PrismaClient()`) doesn't "fix" this back
to something that no longer works with Prisma 7, and so anyone debugging a Prisma
connection error later knows to check `db.js`'s adapter wiring first.

**Alternatives considered:**
- *Pin to an older Prisma major (5 or 6) that still supports schema `url`* — would avoid
  the adapter setup, but means intentionally using an outdated version from day one of a
  new project for no real benefit; the adapter pattern is one extra file, not a real cost.

**Status:** Decided.

**Addendum (2026-07-11):** `prisma migrate dev` refuses to run at all in a non-interactive
shell whenever it has *any* warning to show (e.g. adding a unique constraint), even with
`--create-only`. Workaround: hand-write the migration's `migration.sql` in a new
`prisma/migrations/<timestamp>_<name>/` folder, then run `prisma migrate deploy` (which
doesn't require a TTY) to apply it, followed by `prisma generate`. Fine for additive/safe
changes; double-check the SQL by hand for anything that could actually be destructive.

---

## 2026-07-11 — Dev-only login bypass, double-gated against ever running in production

**Decision:** Added `POST /api/auth/dev-login`, which skips Google verification entirely
and logs in as any email/role you give it. It only responds when **both**
`NODE_ENV !== "production"` **and** `ENABLE_DEV_LOGIN=true` are set — either one being
false/unset is enough to make it 404. The frontend's matching dev-login form on
`Login.jsx` only renders when `REACT_APP_ENABLE_DEV_LOGIN=true`, which lives in a
gitignored `.env.local` (never the committed `.env`), since CRA bakes `REACT_APP_*` vars
into the build at build time, not checked at runtime like the backend's `NODE_ENV` check.

**Why:** Testing this app requires a real `@vitstudent.ac.in` Google account, and the
person actually driving development doesn't reliably have one available on every machine
they work from (blocked by an org's Google Workspace policy on one machine, Windows setup
friction on another). Without this, every round of frontend/backend changes behind
`ProtectedRoute` would be untestable locally. This is a standard pattern for exactly this
situation — the risk is an auth bypass reaching a real deployment, which the double gate
(env-var AND NODE_ENV, checked server-side) is specifically designed to prevent even if
one of the two safeguards is forgotten.

**Alternatives considered:**
- *Just use the real Google flow, always* — the actual blocker this round was an account
  access limitation, not a preference; blocked on env restrictions we don't fully control.
- *Gate on `NODE_ENV` alone* — rejected; relying on a single flag means one misconfigured
  deploy (`NODE_ENV` unset or wrong) silently exposes it. Two independent flags are safer
  than one.
- *Gate on `ENABLE_DEV_LOGIN` alone* — same reasoning, rejected for the same single-point-
  of-failure risk.

**Status:** Decided. Must never be enabled (`ENABLE_DEV_LOGIN=true` / `NODE_ENV` anything
but `production`) on whatever the college ends up hosting this on.

---

## 2026-07-11 — DomainAssignment stores head name as a string, not a User FK

**Decision:** `DomainAssignment.headName` is a plain string field. The original schema
draft had it as a required FK to `User` (see the first ARCHITECTURE.md draft) — changed
during Stretch 3 implementation, before any real data was lost to it (caught at seed-data
time, not after).

**Why:** The domain head names/phone numbers already sitting in `DomainInfo.jsx`
(e.g. "Vedika Goyal", "9740179001") aren't tied to any known email address, so they aren't
registered `User` accounts in this system and likely won't be for most cycles — domain
heads are contact info to display, not necessarily people who ever log in. A required FK
to `User` would have forced fabricating placeholder accounts with made-up emails just to
satisfy the constraint, which is worse than the field it was trying to model.

**Alternatives considered:**
- *Keep the `User` FK, make it optional* — still doesn't solve displaying a name for a
  head who has no account at all, which is the common case with the current seed data.
- *Create real `User` rows for each head anyway* — rejected; inventing email addresses for
  real people is actively wrong, not just inconvenient.

**Status:** Decided.

---

<!--
Template for new entries:

## YYYY-MM-DD — <short decision title>

**Decision:** <what was decided>

**Why:** <the reasoning, referencing PRD/architecture sections where relevant>

**Alternatives considered:** <what else was on the table and why it lost>

**Status:** Decided | Revisit if <condition>
-->
