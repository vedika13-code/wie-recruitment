# PRD — IEEE WIE Recruitment Portal

Status: Draft v0.3
Owner: Devyani Bishnoi
Last updated: 2026-07-11

## 1. Purpose

The IEEE WIE (Women in Engineering) college chapter runs a recruitment cycle each year to
onboard new members into its domains (Technical, Projects, Management, Editorial, Design,
Publicity). Today this is a frontend-only React app with no real backend — "auth" is a
client-side string check, and all applicant data (profile, domain choice, task completion)
lives in `localStorage`, which means nothing persists across devices/browsers and nothing is
visible to the people running recruitment.

This PRD scopes the work to turn it into a real system: persistent accounts, a real
application pipeline, and a way for the chapter's panel to review and progress applicants.

## 2. Users

- **Applicant** — a student applying to join IEEE WIE. Signs in, fills profile, picks up
  to 2 domains, completes domain task(s), tracks status, eventually gets interviewed.
- **Admin** — reviews submitted tasks/applications across **all** domains (not scoped to
  a single domain), scores/annotates, shortlists or rejects applicants, and manages
  interview slots (day, time, meet link) for shortlisted applicants.
- **Super Admin** — everything an Admin can do, plus the only role that can add or remove
  other admins from the "Manage Admins" page. For the 2026 cycle, the initial Admin/Super
  Admin accounts are a hardcoded email allowlist (see [§4.1](#41-auth)); going forward,
  a Super Admin adds next year's admins in-app instead of someone editing code.

  Resolves what was previously an open question (v0.1 had no admin role defined) — see
  [DECISIONS.md](./DECISIONS.md) for the reasoning.

## 3. Recruitment Flow (v1)

Mirrors the pages that already exist in the frontend:

1. **Login** — Google sign-in, restricted to the college email domain.
2. **Home** — landing page, "Apply Now" CTA, and an **application-deadline countdown**
   once a cycle is open.
3. **Profile** — applicant fills personal + academic details (name, phone, registration
   number, branch, specialization, age, hosteller/day-scholar) plus **optional** links:
   GitHub, LinkedIn, portfolio URL.
4. **Domain selection** — applicant picks **up to 2** of the 6 fixed domains.
5. **Tasks** — one task per selected domain, presented like a form: each question has its
   own typed answer field, not one PDF for the whole domain. Some domains additionally
   expect a work artifact (code, blog link, design file) alongside the answers — see
   [§4.2](#42-applicant-facing) for the per-domain shape.
6. **Dashboard** — applicant's home base: shows profile summary, selected domain(s), and
   which stage of the pipeline (Profile → Domain → Tasks → Interview) is unlocked.
7. **Interview** — locked until an admin reviews the applicant's task submissions and
   shortlists them; once shortlisted, the applicant **self-books an open interview slot**
   from a list admins created (see [§4.2](#42-applicant-facing)), then sees their booked
   date/time and meet link.
8. **Domain Info** — static reference page describing each domain and its head's contact
   info; not part of the applicant pipeline, informational only.
9. **Admin Dashboard** *(new)* — admin-only view across all domains' applicants,
   submissions, interview slot creation, and per-domain task configuration.
10. **Manage Admins** *(new, Super Admin only)* — add/remove admin accounts by email.

### Resolved: domain selection count

`Apply.jsx` said up to 2 domains, `Domain.jsx`'s code only allowed 1 — **resolved to 2**.
`Domain.jsx`'s toggle logic needs to change from single-select to a max-2 multi-select
(reject a 3rd pick with a message rather than silently ignoring it).

## 4. Functional Requirements

### 4.1 Auth
- Sign in with Google, restricted to the college's email domain (`@vitstudent.ac.in`).
- On first sign-in, create a user record; on repeat sign-in, resume the existing account.
- Session persists across page reloads and devices (not just `localStorage` on one browser).
- Role is resolved at sign-in time: if the signed-in email matches the hardcoded 2026
  allowlist, the user is created/logged in as Admin or Super Admin instead of Applicant.
  Everyone else is an Applicant.
- Applicant / Admin / Super Admin determines what a user can see — see §4.3 and §4.4.

### 4.2 Applicant-facing
- Fill and update profile details until the application deadline passes. Name, phone,
  reg no, branch, specialization, age, and residence type stay **required**; GitHub,
  LinkedIn, and portfolio URL are **optional**.
- Select up to 2 domains (was previously a v0.1 open discrepancy — now resolved, see §3).
- Per selected domain: answer a form of fixed questions (question + typed text answer
  under each one, not a single PDF for the whole domain). Some domains also require a work
  artifact alongside the answers, **decided per admin, per domain, per cycle** — an admin
  can turn the artifact requirement on or off for a domain and choose its type (code repo
  link, code file upload, blog post link, design file upload), rather than it being fixed
  in the schema or code. A reasonable starting default (confirm/adjust in the admin UI
  once built, per [§4.3](#43-admin-facing)):

  | Domain | Answer format | Default work artifact |
  |---|---|---|
  | Technical | Text answers | Code — repo link or file upload |
  | Editorial | Text answers | Blog post link (URL) |
  | Design | Text answers | Design file upload (image/PDF) |
  | Projects | Text answers | None |
  | Management | Text answers | None |
  | Publicity | Text answers | None |

- Answers and any uploaded/linked artifact can be **edited any number of times up until
  the deadline** — not one-shot. Saving is an upsert, not an insert-only submit.
- **The application deadline is a hard cutoff.** Once it passes, both the server and the
  UI block further edits to profile, domain selection, and task answers/artifacts — the
  countdown isn't just informational, it reflects a real enforced boundary.
- View live status per domain: not started / submitted / under review / shortlisted /
  rejected / selected.
- See an application-deadline countdown on Home/Dashboard once a cycle is open; once it
  hits zero, the UI reflects that editing is now closed (not just a visual "0" with forms
  still active).
- Interview section unlocks once an admin marks submissions reviewed and shortlists the
  applicant. Once unlocked, the applicant sees a list of open interview slots (admin-
  created, each with a capacity — see §4.3) and **self-books one**, first-come-first-served.
  A slot that has reached its capacity shows as unavailable to everyone else. An applicant
  can hold one booking at a time.

### 4.3 Admin-facing
- View applicants and their submissions across **all** domains for the active cycle (not
  restricted to a single domain) — this is a deliberate widening from v0.1's "Domain
  Head reviews only their domain" assumption, matching what was actually requested.
- View each applicant's profile, text answers, and any uploaded/linked work artifact.
- Score/annotate and move an applicant to shortlisted / rejected.
- **Per-domain task configuration**: for the active cycle, turn a domain's work-artifact
  requirement on or off, and pick its type (code link, code file, blog link, design file)
  — this is what makes the table in §4.2 an editable default instead of a hardcoded fact.
- **Interview slots**: create a slot (date, start/end time, meet link, and a **capacity** —
  how many applicants may book it). Admins do not assign applicants to slots directly;
  applicants self-book (§4.2). Admins can see who has booked each slot and how much
  capacity remains.
- Record interview outcome (selected / rejected) once conducted.

### 4.4 Super Admin-facing
- Everything an Admin can do (§4.3), plus:
- "Manage Admins" page: add a new admin by college email, or remove an existing one.
- Only Super Admins can reach this page/endpoint — a regular Admin should get a 403 if
  they try to hit it directly, not just have the link hidden in the UI.
- **Removing an admin does not erase their history.** Their past reviews, scores,
  reviewer notes, and any interview slots they created stay attributed to them exactly as
  before — "remove admin" revokes future access (they go back to being a regular
  Applicant-level account, or lose login entirely, per whatever's decided at build time),
  it does not delete their user record or reassign/anonymize what they already did.

### 4.5 Multi-cycle support
- The system must support running this same flow again in future years without a schema
  rework. Concretely: every application, submission, domain-head assignment, and admin
  account is scoped to a **Recruitment Cycle** (e.g. "2026"), not global. A student's
  profile can persist across cycles, but their application status is per-cycle.
- The 2026 Admin/Super Admin allowlist is hardcoded for launch; from then on, a Super
  Admin can add next cycle's admins in-app (§4.4) instead of a code change — this is what
  makes "reusable across future years" actually true for the people running recruitment,
  not just for the data model.
- v1 does not need a UI for creating/closing a cycle itself — that can be a manual DB
  operation initially — but the *data model* must have the concept from day one so it
  isn't retrofitted later.

## 5. Non-Functional Requirements

- Only college email addresses may sign in (enforced server-side, not just client-side).
- Uploaded work artifacts (code files, design files) and typed task answers must be stored
  durably (not just passed through and discarded) — admins need to open/read them later.
- Existing look/feel and page structure should be preserved for this phase of work; a full
  visual redesign is planned but deliberately sequenced to the end of the roadmap (see
  [ROADMAP.md](./ROADMAP.md)) so functional work isn't repeatedly rebuilt against a moving
  visual target.
- Hosting is handled by the college; the app should not assume a specific PaaS (e.g. no
  hard dependency on a serverless-only feature) so it's portable to whatever they provide.
- Admin-only and Super-Admin-only endpoints must enforce role server-side; the frontend
  hiding a button is not access control.
- The application deadline must be enforced **server-side**, not just as a disabled
  button in the UI — a direct API call after the deadline must also be rejected.
- Interview slot booking must be protected against a race (two applicants booking the
  last open seat on a slot at the same moment) — capacity checks need to happen
  atomically at the database level, not just checked-then-written in application code.

## 6. Out of Scope (v1)

- UI for creating/closing a recruitment cycle itself (still a manual DB operation).
- Calendar-integrated interview scheduling (Google Calendar/Calendly-style booking) —
  v1 is a simple in-app slot list + meet link + capacity, not a synced calendar.
- Email notifications (status changes, deadlines, booked interview slot).
- Analytics/reporting dashboards for the chapter.
- Per-domain-scoped admin accounts (an admin who can only see one domain) — all admins
  see all domains in v1, per §4.3.
- Admins manually assigning applicants to interview slots — v1 is self-service booking
  by the applicant, per §4.2.

## 7. Open Questions

Resolved this round (kept here for history, see [DECISIONS.md](./DECISIONS.md)):
- ~~Domain selection count: 1 or 2?~~ → 2.
- ~~Admin role shape?~~ → Admin (all-domain access) + Super Admin (can manage admins),
  hardcoded 2026 allowlist.
- ~~Interview scheduling in-app or manual?~~ → In-app, admin-created slots.
- ~~Can applicants resubmit/edit before a deadline?~~ → Yes, editable up to the deadline.
- ~~Does the countdown actually block submission?~~ → Yes, hard enforced cutoff.
- ~~Is the per-domain artifact mapping admin-editable?~~ → Yes, admin picks per domain
  per cycle whether an artifact is required and its type.
- ~~Do interview slots need double-booking protection / capacity?~~ → Yes — admin sets a
  capacity per slot, applicants self-book, slot shows unavailable once full.
- ~~What happens to a removed admin's history?~~ → Stays exactly as-is, permanently.

Still open:
1. When an admin's access is revoked, does their account fully lose login (demoted to no
   role / can't sign in as anything meaningful), or specifically demoted back to a plain
   Applicant account? Doesn't change the data model, just the exact resulting state.
2. Can a Super Admin edit a slot's capacity downward below its current booking count
   (e.g. capacity 5, 4 booked, admin sets capacity to 2)? If allowed, what happens to the
   applicants already booked past the new capacity?
3. Does an applicant's own booking count against a slot's remaining-capacity display
   before or after they've committed (i.e. is there any kind of hold/reservation window,
   or is booking instant and final until the applicant is allowed to change it)?
