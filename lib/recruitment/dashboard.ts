import "server-only";
import prisma from "./db";
import { getActiveCycle } from "./cycle";

export type DashboardData = {
  profile: { name: string | null };
  cycle: { applicationDeadline: Date | null; taskDeadline: Date | null };
  selectedDomains: string[];
  submittedDomains: string[];
  applicationStatus: string;
};

export async function getDashboardData(userId: string, userName: string | null): Promise<DashboardData> {
  const cycle = await getActiveCycle();

  const domains = await prisma.domain.findMany();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId } },
    include: { applicationDomains: true },
  });

  const selectedDomainIds = application?.applicationDomains.map((ad) => ad.domainId) ?? [];
  const selectedDomains = domains
    .filter((d) => selectedDomainIds.includes(d.id))
    .map((d) => d.name);

  let submittedDomains: string[] = [];
  if (application) {
    const submitted = await prisma.submission.findMany({
      where: { applicationId: application.id, status: "submitted" },
      select: { domainId: true },
    });
    const submittedIds = submitted.map((s) => s.domainId);
    submittedDomains = domains.filter((d) => submittedIds.includes(d.id)).map((d) => d.name);
  }

  return {
    profile: { name: userName },
    cycle: {
      applicationDeadline: cycle.applicationDeadline,
      taskDeadline: cycle.taskDeadline,
    },
    selectedDomains,
    submittedDomains,
    applicationStatus: application?.status ?? "draft",
  };
}
