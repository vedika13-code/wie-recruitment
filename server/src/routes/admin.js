const { Router } = require("express");
const prisma = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getActiveCycle } = require("../services/cycle");

const router = Router();

// Every route below requires admin or super_admin — applied once at router level so
// no individual route can accidentally be added without the guard.
router.use(requireAuth, requireRole("admin", "super_admin"));

const ARTIFACT_TYPES = ["none", "code_link", "code_file", "blog_link", "design_file"];
const APPLICATION_STATUSES = ["draft", "submitted", "shortlisted", "rejected", "selected"];

function toDomainSummary(applicationDomains, submissions) {
  return applicationDomains.map((ad) => {
    const submission = submissions.find((s) => s.domainId === ad.domainId);
    return {
      domainId: ad.domainId,
      domainName: ad.domain.name,
      submissionId: submission?.id || null,
      submissionStatus: submission?.status || "in_progress",
      score: submission?.score ?? null,
      reviewerNotes: submission?.reviewerNotes || null,
      artifactType: submission?.artifactType || null,
      artifactUrl: submission?.artifactUrl || null,
    };
  });
}

router.get("/applications", async (req, res) => {
  const cycle = await getActiveCycle();
  const { domain, status } = req.query;

  const applications = await prisma.application.findMany({
    where: {
      cycleId: cycle.id,
      ...(status ? { status } : {}),
      ...(domain ? { applicationDomains: { some: { domain: { name: domain } } } } : {}),
    },
    include: {
      user: true,
      applicationDomains: { include: { domain: true } },
      submissions: true,
    },
  });

  res.json(
    applications.map((application) => ({
      applicationId: application.id,
      status: application.status,
      user: {
        id: application.user.id,
        name: application.user.name,
        email: application.user.email,
        phone: application.user.phone,
        regNo: application.user.regNo,
        branch: application.user.branch,
        specialization: application.user.specialization,
        age: application.user.age,
        residenceType: application.user.residenceType,
        githubUrl: application.user.githubUrl,
        linkedinUrl: application.user.linkedinUrl,
        portfolioUrl: application.user.portfolioUrl,
      },
      domains: toDomainSummary(application.applicationDomains, application.submissions),
    }))
  );
});

router.get("/applications/:id", async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: {
      user: true,
      applicationDomains: { include: { domain: true } },
      submissions: true,
      answers: { include: { taskQuestion: true } },
    },
  });
  if (!application) return res.status(404).json({ error: "Application not found" });

  const domains = toDomainSummary(application.applicationDomains, application.submissions).map(
    (d) => ({
      ...d,
      answers: application.answers
        .filter((a) => a.taskQuestion.domainId === d.domainId)
        .sort((a, b) => a.taskQuestion.order - b.taskQuestion.order)
        .map((a) => ({ question: a.taskQuestion.questionText, answer: a.answerText })),
    })
  );

  res.json({
    applicationId: application.id,
    status: application.status,
    user: application.user,
    domains,
  });
});

router.post("/applications/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!APPLICATION_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const application = await prisma.application.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json({ status: application.status });
});

router.post("/submissions/:id/review", async (req, res) => {
  const { score, notes, status } = req.body;
  const data = {};
  if (score !== undefined) data.score = score === null || score === "" ? null : Number(score);
  if (notes !== undefined) data.reviewerNotes = notes;
  if (status !== undefined) data.status = status;

  const submission = await prisma.submission.update({ where: { id: req.params.id }, data });
  res.json({
    id: submission.id,
    score: submission.score,
    reviewerNotes: submission.reviewerNotes,
    status: submission.status,
  });
});

router.get("/domain-task-config", async (req, res) => {
  const cycle = await getActiveCycle();
  const domains = await prisma.domain.findMany({ orderBy: { name: "asc" } });
  const configs = await prisma.domainTaskConfig.findMany({ where: { cycleId: cycle.id } });
  const configByDomain = Object.fromEntries(configs.map((c) => [c.domainId, c]));

  res.json(
    domains.map((d) => ({
      domainId: d.id,
      domainName: d.name,
      artifactType: configByDomain[d.id]?.artifactType || "none",
      artifactLabel: configByDomain[d.id]?.artifactLabel || null,
    }))
  );
});

router.put("/domain-task-config/:domain", async (req, res) => {
  const domain = await prisma.domain.findUnique({ where: { name: req.params.domain } });
  if (!domain) return res.status(404).json({ error: "Unknown domain" });

  const { artifactType, artifactLabel } = req.body;
  if (!ARTIFACT_TYPES.includes(artifactType)) {
    return res.status(400).json({ error: "Invalid artifact type" });
  }

  const cycle = await getActiveCycle();
  const config = await prisma.domainTaskConfig.upsert({
    where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
    update: { artifactType, artifactLabel: artifactLabel || null },
    create: {
      cycleId: cycle.id,
      domainId: domain.id,
      artifactType,
      artifactLabel: artifactLabel || null,
    },
  });

  res.json({
    domainName: domain.name,
    artifactType: config.artifactType,
    artifactLabel: config.artifactLabel,
  });
});

router.get("/interview-slots", async (req, res) => {
  const cycle = await getActiveCycle();
  const slots = await prisma.interviewSlot.findMany({
    where: { cycleId: cycle.id },
    include: { interviews: { include: { application: { include: { user: true } } } } },
    orderBy: [{ slotDate: "asc" }, { startTime: "asc" }],
  });

  res.json(
    slots.map((s) => ({
      id: s.id,
      slotDate: s.slotDate,
      startTime: s.startTime,
      endTime: s.endTime,
      meetLink: s.meetLink,
      capacity: s.capacity,
      bookedCount: s.interviews.length,
      bookings: s.interviews.map((i) => ({
        applicationId: i.applicationId,
        name: i.application.user.name,
        email: i.application.user.email,
      })),
    }))
  );
});

router.post("/interview-slots", async (req, res) => {
  const { slotDate, startTime, endTime, meetLink, capacity } = req.body;
  if (!slotDate || !startTime || !endTime || !meetLink || !capacity) {
    return res
      .status(400)
      .json({ error: "slotDate, startTime, endTime, meetLink, and capacity are required" });
  }
  if (Number(capacity) < 1) {
    return res.status(400).json({ error: "capacity must be at least 1" });
  }

  const cycle = await getActiveCycle();
  const slot = await prisma.interviewSlot.create({
    data: {
      cycleId: cycle.id,
      createdById: req.user.id,
      // Force UTC parsing explicitly — a bare "1970-01-01THH:MM" string (no timezone
      // designator) is parsed as the SERVER's local time per the ECMAScript spec, which
      // would silently shift stored times depending on where the process happens to run.
      slotDate: new Date(`${slotDate}T00:00:00.000Z`),
      startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
      endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
      meetLink,
      capacity: Number(capacity),
    },
  });

  res.json({ id: slot.id });
});

const ADMIN_MANAGED_ROLES = ["admin", "super_admin"];

// These three routes are additionally gated to super_admin only, on top of the
// router-level admin-or-super_admin guard above — a regular admin must not manage
// other admins.
router.get("/admins", requireRole("super_admin"), async (req, res) => {
  const admins = await prisma.user.findMany({
    where: { role: { in: ADMIN_MANAGED_ROLES } },
    include: { addedBy: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  res.json(
    admins.map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      role: a.role,
      addedBy: a.addedBy ? a.addedBy.name || a.addedBy.email : null,
    }))
  );
});

router.post("/admins", requireRole("super_admin"), async (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ error: "email is required" });
  if (!ADMIN_MANAGED_ROLES.includes(role)) {
    return res.status(400).json({ error: "role must be admin or super_admin" });
  }
  const normalizedEmail = email.toLowerCase();

  // Upsert, not create-only: this works whether the person has ever signed in
  // before (updates their existing role) or hasn't (pre-creates the record, so
  // their eventual first Google/dev sign-in finds it and skips the allowlist
  // check entirely — same mechanism as the hardcoded 2026 allowlist bootstrap).
  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { role, addedById: req.user.id },
    create: { email: normalizedEmail, role, addedById: req.user.id },
  });

  res.json({ id: user.id, email: user.email, role: user.role });
});

router.delete("/admins/:id", requireRole("super_admin"), async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: "You cannot remove your own admin access" });
  }

  // Only ever flips role back down — the user row must never be deleted, since
  // Submission.reviewerNotes and InterviewSlot.createdById attribution must survive
  // removal (see docs/DECISIONS.md).
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: "applicant" },
  });

  res.json({ id: user.id, role: user.role });
});

module.exports = router;
