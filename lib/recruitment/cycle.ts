import "server-only";
import prisma from "./db";
import type { Cycle } from "@/generated/prisma";

export class CycleError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getActiveCycle(): Promise<Cycle> {
  const cycle = await prisma.cycle.findFirst({ where: { status: "open" } });
  if (!cycle) throw new CycleError("No active recruitment cycle", 409);
  return cycle;
}

export async function getOrCreateApplication(userId: string, cycleId: string) {
  return prisma.application.upsert({
    where: { cycleId_userId: { cycleId, userId } },
    update: {},
    create: { userId, cycleId },
  });
}

const DEADLINE_LABELS = {
  applicationDeadline: "application",
  taskDeadline: "task",
} as const;

type DeadlineField = keyof typeof DEADLINE_LABELS;

// Fetches the active cycle and throws (423 Locked) if the given deadline field has
// already passed. Returns the cycle so callers that need it anyway don't have to
// fetch it twice.
export async function assertActiveCycleDeadline(deadlineField: DeadlineField): Promise<Cycle> {
  const cycle = await getActiveCycle();
  const deadline = cycle[deadlineField];
  if (deadline && new Date() > new Date(deadline)) {
    throw new CycleError(`The ${DEADLINE_LABELS[deadlineField]} deadline has passed`, 423);
  }
  return cycle;
}
