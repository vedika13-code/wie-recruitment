import "server-only";
import prisma from "./db";
import { getActiveCycle } from "./cycle";

export type DomainWithHead = {
  id: string;
  name: string;
  description: string | null;
  head: { name: string; phone: string | null } | null;
};

export async function getDomainsWithHeads(): Promise<DomainWithHead[]> {
  const activeCycle = await prisma.cycle.findFirst({ where: { status: "open" } });

  const domains = await prisma.domain.findMany({
    orderBy: { name: "asc" },
    include: {
      // Always include (rather than a conditional include) so the shape stays
      // consistent regardless of whether a cycle is active — filtered to a cycle id
      // that can never match when there isn't one, so the array is simply empty.
      domainAssignments: { where: { cycleId: activeCycle?.id ?? "__no_active_cycle__" } },
    },
  });

  return domains.map((d) => {
    const assignment = d.domainAssignments[0];
    return {
      id: d.id,
      name: d.name,
      description: d.description,
      head: assignment ? { name: assignment.headName, phone: assignment.phone } : null,
    };
  });
}

// Not a Server Action — read-only, called directly from Server Components.
export async function getSelectedDomainIds(userId: string): Promise<string[]> {
  const cycle = await getActiveCycle();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId } },
    include: { applicationDomains: true },
  });
  return application?.applicationDomains.map((ad) => ad.domainId) ?? [];
}
