const { Router } = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");
const { getActiveCycle, getOrCreateApplication } = require("../services/cycle");
const { upload } = require("../uploads");

const router = Router();

const LINK_ARTIFACT_TYPES = ["code_link", "blog_link"];
const FILE_ARTIFACT_TYPES = ["code_file", "design_file"];

function findDomain(name) {
  return prisma.domain.findUnique({ where: { name } });
}

// Must come before "/:domain" so it isn't swallowed as a domain-name lookup.
router.get("/progress", requireAuth, async (req, res) => {
  const cycle = await getActiveCycle();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId: req.user.id } },
  });
  if (!application) return res.json({ submittedDomainIds: [] });

  const submitted = await prisma.submission.findMany({
    where: { applicationId: application.id, status: "submitted" },
    select: { domainId: true },
  });
  res.json({ submittedDomainIds: submitted.map((s) => s.domainId) });
});

router.get("/:domain", requireAuth, async (req, res) => {
  const domain = await findDomain(req.params.domain);
  if (!domain) return res.status(404).json({ error: "Unknown domain" });

  const cycle = await getActiveCycle();
  const config = await prisma.domainTaskConfig.findUnique({
    where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
  });
  const questions = await prisma.taskQuestion.findMany({
    where: { cycleId: cycle.id, domainId: domain.id },
    orderBy: { order: "asc" },
  });

  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId: req.user.id } },
  });

  let answerByQuestion = {};
  let submission = null;
  if (application) {
    const answers = await prisma.answer.findMany({
      where: { applicationId: application.id, taskQuestionId: { in: questions.map((q) => q.id) } },
    });
    answerByQuestion = Object.fromEntries(answers.map((a) => [a.taskQuestionId, a.answerText]));
    submission = await prisma.submission.findUnique({
      where: { applicationId_domainId: { applicationId: application.id, domainId: domain.id } },
    });
  }

  res.json({
    domain: { id: domain.id, name: domain.name },
    artifactConfig: { type: config?.artifactType || "none", label: config?.artifactLabel || null },
    questions: questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      order: q.order,
      answerText: answerByQuestion[q.id] || "",
    })),
    submission: submission
      ? { artifactType: submission.artifactType, artifactUrl: submission.artifactUrl, status: submission.status }
      : null,
  });
});

router.post("/:domain/answers", requireAuth, async (req, res) => {
  const domain = await findDomain(req.params.domain);
  if (!domain) return res.status(404).json({ error: "Unknown domain" });

  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "answers must be an array" });
  }

  const cycle = await getActiveCycle();
  const validQuestions = await prisma.taskQuestion.findMany({
    where: { cycleId: cycle.id, domainId: domain.id },
    select: { id: true },
  });
  const validQuestionIds = new Set(validQuestions.map((q) => q.id));
  for (const a of answers) {
    if (!validQuestionIds.has(a.questionId)) {
      return res.status(400).json({ error: "Invalid question for this domain" });
    }
  }

  const application = await getOrCreateApplication(req.user.id, cycle.id);

  await Promise.all(
    answers.map((a) =>
      prisma.answer.upsert({
        where: {
          applicationId_taskQuestionId: {
            applicationId: application.id,
            taskQuestionId: a.questionId,
          },
        },
        update: { answerText: a.text },
        create: {
          applicationId: application.id,
          taskQuestionId: a.questionId,
          answerText: a.text,
        },
      })
    )
  );

  res.json({ ok: true });
});

router.post("/:domain/artifact", requireAuth, upload.single("file"), async (req, res) => {
  const domain = await findDomain(req.params.domain);
  if (!domain) return res.status(404).json({ error: "Unknown domain" });

  const cycle = await getActiveCycle();
  const config = await prisma.domainTaskConfig.findUnique({
    where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
  });
  const artifactType = config?.artifactType || "none";
  if (artifactType === "none") {
    return res.status(400).json({ error: "This domain does not require an artifact" });
  }

  let artifactUrl;
  if (LINK_ARTIFACT_TYPES.includes(artifactType)) {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: "A valid http(s) URL is required" });
    }
    artifactUrl = url;
  } else if (FILE_ARTIFACT_TYPES.includes(artifactType)) {
    if (!req.file) return res.status(400).json({ error: "A file is required" });
    artifactUrl = `/uploads/${req.file.filename}`;
  }

  const application = await getOrCreateApplication(req.user.id, cycle.id);
  const submission = await prisma.submission.upsert({
    where: { applicationId_domainId: { applicationId: application.id, domainId: domain.id } },
    update: { artifactType, artifactUrl },
    create: { applicationId: application.id, domainId: domain.id, artifactType, artifactUrl },
  });

  res.json({ artifactType: submission.artifactType, artifactUrl: submission.artifactUrl });
});

router.post("/:domain/submit", requireAuth, async (req, res) => {
  const domain = await findDomain(req.params.domain);
  if (!domain) return res.status(404).json({ error: "Unknown domain" });

  const cycle = await getActiveCycle();
  const config = await prisma.domainTaskConfig.findUnique({
    where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
  });
  const application = await getOrCreateApplication(req.user.id, cycle.id);

  const existing = await prisma.submission.findUnique({
    where: { applicationId_domainId: { applicationId: application.id, domainId: domain.id } },
  });

  const requiresArtifact = config && config.artifactType !== "none";
  if (requiresArtifact && !existing?.artifactUrl) {
    return res.status(400).json({ error: "Please provide the required artifact before submitting" });
  }

  const submission = await prisma.submission.upsert({
    where: { applicationId_domainId: { applicationId: application.id, domainId: domain.id } },
    update: { status: "submitted", submittedAt: new Date() },
    create: {
      applicationId: application.id,
      domainId: domain.id,
      status: "submitted",
      submittedAt: new Date(),
    },
  });

  res.json({ status: submission.status });
});

module.exports = router;
