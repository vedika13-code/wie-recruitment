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

const DEADLINE_LABELS = {
  applicationDeadline: "application",
  taskDeadline: "task",
};

// Fetches the active cycle and throws (423 Locked) if the given deadline field has
// already passed. Returns the cycle so callers that need it anyway don't have to
// fetch it twice.
async function assertActiveCycleDeadline(deadlineField) {
  const cycle = await getActiveCycle();
  const deadline = cycle[deadlineField];
  if (deadline && new Date() > new Date(deadline)) {
    const err = new Error(`The ${DEADLINE_LABELS[deadlineField]} deadline has passed`);
    err.status = 423;
    throw err;
  }
  return cycle;
}

module.exports = { getActiveCycle, getOrCreateApplication, assertActiveCycleDeadline };
