const { Router } = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const activeCycle = await prisma.cycle.findFirst({ where: { status: "open" } });

  const domains = await prisma.domain.findMany({
    orderBy: { name: "asc" },
    include: activeCycle
      ? { domainAssignments: { where: { cycleId: activeCycle.id } } }
      : undefined,
  });

  res.json(
    domains.map((d) => {
      const assignment = d.domainAssignments?.[0];
      return {
        id: d.id,
        name: d.name,
        description: d.description,
        head: assignment ? { name: assignment.headName, phone: assignment.phone } : null,
      };
    })
  );
});

module.exports = router;
