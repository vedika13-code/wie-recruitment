const prisma = require("../db");

async function getActiveCycle() {
  const cycle = await prisma.cycle.findFirst({ where: { status: "open" } });
  if (!cycle) {
    const err = new Error("No active recruitment cycle");
    err.status = 409;
    throw err;
  }
  return cycle;
}

async function getOrCreateApplication(userId, cycleId) {
  return prisma.application.upsert({
    where: { cycleId_userId: { cycleId, userId } },
    update: {},
    create: { userId, cycleId },
  });
}

module.exports = { getActiveCycle, getOrCreateApplication };
