"use server";

import prisma from "@/lib/recruitment/db";
import { requireAuth, requireAdmin } from "@/lib/recruitment/auth";
import { getActiveCycle } from "@/lib/recruitment/cycle";
import { isInterviewUnlocked } from "@/lib/recruitment/interviewStatus";
import { actionOk, actionErr, actionErrFromCaught, type ActionResult } from "@/lib/recruitment/actionResult";

export async function bookInterviewSlotAction(slotId: string): Promise<ActionResult<{ ok: true }>> {
  try {
    const user = await requireAuth();
    if (!slotId) return actionErr(400, "slotId is required");

    const cycle = await getActiveCycle();
    const application = await prisma.application.findUnique({
      where: { cycleId_userId: { cycleId: cycle.id, userId: user.id } },
    });
    if (!application || !isInterviewUnlocked(application.status)) {
      return actionErr(403, "Interview is locked");
    }

    const existing = await prisma.interview.findUnique({
      where: { applicationId: application.id },
    });
    if (existing?.interviewSlotId) {
      return actionErr(409, "You already have a booked slot");
    }

    await prisma.$transaction(async (tx) => {
      // Row-locks the slot for the duration of this transaction — a concurrent booking
      // request for the same slot blocks here until this transaction commits/rolls back,
      // then re-reads the up-to-date booked count. This is what actually prevents two
      // applicants both landing the last open seat; a plain read-then-write (SELECT
      // count, then INSERT in separate statements) would not be safe under concurrency.
      // Ported verbatim from server/src/routes/interview.js — do not split this into
      // separate statements outside the transaction.
      const slotRows = await tx.$queryRaw<{ id: string; capacity: number }[]>`
        SELECT id, capacity FROM "InterviewSlot" WHERE id = ${slotId} FOR UPDATE
      `;
      const slot = slotRows[0];
      if (!slot) {
        throw Object.assign(new Error("Slot not found"), { status: 404 });
      }

      const countRows = await tx.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int AS count FROM "Interview" WHERE "interviewSlotId" = ${slotId}
      `;
      const bookedCount = countRows[0].count;
      if (bookedCount >= slot.capacity) {
        throw Object.assign(new Error("This slot is no longer available"), { status: 409 });
      }

      await tx.interview.upsert({
        where: { applicationId: application.id },
        update: { interviewSlotId: slotId, status: "scheduled" },
        create: { applicationId: application.id, interviewSlotId: slotId, status: "scheduled" },
      });
    });

    return actionOk({ ok: true });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}

export async function createInterviewSlotAction(input: {
  slotDate: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  capacity: number | string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdmin();
    const { slotDate, startTime, endTime, meetLink, capacity } = input;
    if (!slotDate || !startTime || !endTime || !meetLink || !capacity) {
      return actionErr(400, "slotDate, startTime, endTime, meetLink, and capacity are required");
    }
    if (Number(capacity) < 1) {
      return actionErr(400, "capacity must be at least 1");
    }

    const cycle = await getActiveCycle();
    const slot = await prisma.interviewSlot.create({
      data: {
        cycleId: cycle.id,
        createdById: admin.id,
        // Force UTC parsing explicitly — a bare "1970-01-01THH:MM" string (no timezone
        // designator) is parsed as the SERVER's local time per the ECMAScript spec, which
        // would silently shift stored times depending on where the process happens to
        // run. This is the exact bug already fixed once (see docs/ROADMAP.md Stretch 7) —
        // do not regress to bare new Date(...) parsing.
        slotDate: new Date(`${slotDate}T00:00:00.000Z`),
        startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
        endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
        meetLink,
        capacity: Number(capacity),
      },
    });

    return actionOk({ id: slot.id });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}
