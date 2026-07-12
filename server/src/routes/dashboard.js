const { Router } = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");
const { getActiveCycle } = require("../services/cycle");

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const cycle = await getActiveCycle();

  const domains = await prisma.domain.findMany();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId: req.user.id } },
    include: { applicationDomains: true },
  });

  const selectedDomainIds = application?.applicationDomains.map((ad) => ad.domainId) || [];
  const selectedDomains = domains
    .filter((d) => selectedDomainIds.includes(d.id))
    .map((d) => d.name);

  let submittedDomains = [];
  if (application) {
    const submitted = await prisma.submission.findMany({
      where: { applicationId: application.id, status: "submitted" },
      select: { domainId: true },
    });
    const submittedIds = submitted.map((s) => s.domainId);
    submittedDomains = domains.filter((d) => submittedIds.includes(d.id)).map((d) => d.name);
  }

  res.json({
    profile: { name: req.user.name },
    cycle: {
      applicationDeadline: cycle.applicationDeadline,
      taskDeadline: cycle.taskDeadline,
    },
    selectedDomains,
    submittedDomains,
    applicationStatus: application?.status || "draft",
  });
});

module.exports = router;
