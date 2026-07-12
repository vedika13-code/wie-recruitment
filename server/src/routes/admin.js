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

module.exports = router;
