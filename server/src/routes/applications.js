const { Router } = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");
const {
  getActiveCycle,
  getOrCreateApplication,
  assertActiveCycleDeadline,
} = require("../services/cycle");

const router = Router();

router.get("/domains", requireAuth, async (req, res) => {
  const cycle = await getActiveCycle();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId: req.user.id } },
    include: { applicationDomains: true },
  });
  const domainIds = application?.applicationDomains.map((ad) => ad.domainId) || [];
  res.json({ domainIds });
});

router.post("/domains", requireAuth, async (req, res) => {
  const { domainIds } = req.body;
  if (!Array.isArray(domainIds) || domainIds.length === 0) {
    return res.status(400).json({ error: "domainIds must be a non-empty array" });
  }
  if (domainIds.length > 2) {
    return res.status(400).json({ error: "You may select at most 2 domains" });
  }
  if (new Set(domainIds).size !== domainIds.length) {
    return res.status(400).json({ error: "Duplicate domain selected" });
  }

  const validDomains = await prisma.domain.findMany({
    where: { id: { in: domainIds } },
  });
  if (validDomains.length !== domainIds.length) {
    return res.status(400).json({ error: "One or more domains are invalid" });
  }

  const cycle = await assertActiveCycleDeadline("applicationDeadline");
  const application = await getOrCreateApplication(req.user.id, cycle.id);

  await prisma.$transaction([
    prisma.applicationDomain.deleteMany({ where: { applicationId: application.id } }),
    prisma.applicationDomain.createMany({
      data: domainIds.map((domainId) => ({ applicationId: application.id, domainId })),
    }),
  ]);

  res.json({ domainIds });
});

module.exports = router;
