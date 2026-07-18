"use server";

import prisma from "@/lib/recruitment/db";
import { requireAuth } from "@/lib/recruitment/auth";
import {
  getOrCreateApplication,
  assertActiveCycleDeadline,
} from "@/lib/recruitment/cycle";
import { actionOk, actionErr, actionErrFromCaught, type ActionResult } from "@/lib/recruitment/actionResult";

const MAX_DOMAINS = 2;

export async function setSelectedDomainsAction(
  domainIds: string[]
): Promise<ActionResult<{ domainIds: string[] }>> {
  try {
    const user = await requireAuth();

    if (!Array.isArray(domainIds) || domainIds.length === 0) {
      return actionErr(400, "domainIds must be a non-empty array");
    }
    if (domainIds.length > MAX_DOMAINS) {
      return actionErr(400, `You may select at most ${MAX_DOMAINS} domains`);
    }
    if (new Set(domainIds).size !== domainIds.length) {
      return actionErr(400, "Duplicate domain selected");
    }

    const validDomains = await prisma.domain.findMany({ where: { id: { in: domainIds } } });
    if (validDomains.length !== domainIds.length) {
      return actionErr(400, "One or more domains are invalid");
    }

    // assertActiveCycleDeadline runs AFTER validation, matching the original route's
    // order — checking deadline before validating input would leak whether a cycle is
    // open to a request with garbage domainIds. Ported verbatim, order included.
    const cycle = await assertActiveCycleDeadline("applicationDeadline");
    const application = await getOrCreateApplication(user.id, cycle.id);

    // Must stay a single transaction (array form) — replacing a selection with a
    // separate delete then insert would leave a window where the applicant has zero
    // domains if the process were interrupted between the two.
    await prisma.$transaction([
      prisma.applicationDomain.deleteMany({ where: { applicationId: application.id } }),
      prisma.applicationDomain.createMany({
        data: domainIds.map((domainId) => ({ applicationId: application.id, domainId })),
      }),
    ]);

    return actionOk({ domainIds });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}
