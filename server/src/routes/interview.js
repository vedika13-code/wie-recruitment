const { Router } = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");
const { getActiveCycle } = require("../services/cycle");

const router = Router();

// Interview unlocks once an admin has shortlisted (or later, selected) the application.
const UNLOCKED_STATUSES = ["shortlisted", "selected"];

router.get("/", requireAuth, async (req, res) => {
  const cycle = await getActiveCycle();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId: req.user.id } },
  });

  const unlocked = Boolean(application && UNLOCKED_STATUSES.includes(application.status));
  if (!unlocked) {
    return res.json({ unlocked: false, booking: null, availableSlots: [] });
  }

  const interview = await prisma.interview.findUnique({
    where: { applicationId: application.id },
    include: { interviewSlot: true },
  });

  if (interview?.interviewSlot) {
    return res.json({
      unlocked: true,
      booking: {
        slotDate: interview.interviewSlot.slotDate,
        startTime: interview.interviewSlot.startTime,
        endTime: interview.interviewSlot.endTime,
        meetLink: interview.interviewSlot.meetLink,
      },
      availableSlots: [],
    });
  }

  const slots = await prisma.interviewSlot.findMany({
    where: { cycleId: cycle.id },
    include: { interviews: true },
    orderBy: [{ slotDate: "asc" }, { startTime: "asc" }],
  });

  res.json({
    unlocked: true,
    booking: null,
    availableSlots: slots.map((s) => ({
      id: s.id,
      slotDate: s.slotDate,
      startTime: s.startTime,
      endTime: s.endTime,
      meetLink: s.meetLink,
      capacity: s.capacity,
      bookedCount: s.interviews.length,
    })),
  });
});

router.post("/book", requireAuth, async (req, res) => {
  const { slotId } = req.body;
  if (!slotId) return res.status(400).json({ error: "slotId is required" });

  const cycle = await getActiveCycle();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId: req.user.id } },
  });
  if (!application || !UNLOCKED_STATUSES.includes(application.status)) {
    return res.status(403).json({ error: "Interview is locked" });
  }

  const existing = await prisma.interview.findUnique({ where: { applicationId: application.id } });
  if (existing?.interviewSlotId) {
    return res.status(409).json({ error: "You already have a booked slot" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Row-locks the slot for the duration of this transaction — a concurrent booking
      // request for the same slot blocks here until this transaction commits/rolls back,
      // then re-reads the up-to-date booked count. This is what actually prevents two
      // applicants both landing the last open seat; a plain read-then-write (SELECT
      // count, then INSERT in separate statements) would not be safe under concurrency.
      const slotRows = await tx.$queryRaw`SELECT id, capacity FROM "InterviewSlot" WHERE id = ${slotId} FOR UPDATE`;
      const slot = slotRows[0];
      if (!slot) {
        const e = new Error("Slot not found");
        e.status = 404;
        throw e;
      }

      const countRows = await tx.$queryRaw`SELECT COUNT(*)::int AS count FROM "Interview" WHERE "interviewSlotId" = ${slotId}`;
      const bookedCount = countRows[0].count;
      if (bookedCount >= slot.capacity) {
        const e = new Error("This slot is no longer available");
        e.status = 409;
        throw e;
      }

      await tx.interview.upsert({
        where: { applicationId: application.id },
        update: { interviewSlotId: slotId, status: "scheduled" },
        create: { applicationId: application.id, interviewSlotId: slotId, status: "scheduled" },
      });
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  res.json({ ok: true });
});

module.exports = router;
