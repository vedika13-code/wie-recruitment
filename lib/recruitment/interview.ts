import "server-only";
import prisma from "./db";
import { getActiveCycle } from "./cycle";
import { isInterviewUnlocked } from "./interviewStatus";

export type InterviewSlotView = {
  id: string;
  slotDate: Date;
  startTime: Date;
  endTime: Date;
  meetLink: string;
  capacity: number;
  bookedCount: number;
};

export type InterviewPageData = {
  unlocked: boolean;
  booking: { slotDate: Date; startTime: Date; endTime: Date; meetLink: string } | null;
  availableSlots: InterviewSlotView[];
};

export async function getInterviewPageData(userId: string): Promise<InterviewPageData> {
  const cycle = await getActiveCycle();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId } },
  });

  if (!application || !isInterviewUnlocked(application.status)) {
    return { unlocked: false, booking: null, availableSlots: [] };
  }

  const interview = await prisma.interview.findUnique({
    where: { applicationId: application.id },
    include: { interviewSlot: true },
  });

  if (interview?.interviewSlot) {
    return {
      unlocked: true,
      booking: {
        slotDate: interview.interviewSlot.slotDate,
        startTime: interview.interviewSlot.startTime,
        endTime: interview.interviewSlot.endTime,
        meetLink: interview.interviewSlot.meetLink,
      },
      availableSlots: [],
    };
  }

  const slots = await prisma.interviewSlot.findMany({
    where: { cycleId: cycle.id },
    include: { interviews: true },
    orderBy: [{ slotDate: "asc" }, { startTime: "asc" }],
  });

  return {
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
  };
}

export type AdminInterviewSlot = InterviewSlotView & {
  bookings: { applicationId: string; name: string | null; email: string }[];
};

export async function getAdminInterviewSlots(): Promise<AdminInterviewSlot[]> {
  const cycle = await getActiveCycle();
  const slots = await prisma.interviewSlot.findMany({
    where: { cycleId: cycle.id },
    include: { interviews: { include: { application: { include: { user: true } } } } },
    orderBy: [{ slotDate: "asc" }, { startTime: "asc" }],
  });

  return slots.map((s) => ({
    id: s.id,
    slotDate: s.slotDate,
    startTime: s.startTime,
    endTime: s.endTime,
    meetLink: s.meetLink,
    capacity: s.capacity,
    bookedCount: s.interviews.length,
    bookings: s.interviews.map((i) => ({
      applicationId: i.applicationId,
      name: i.application.user.name,
      email: i.application.user.email,
    })),
  }));
}
