"use server";

import prisma from "@/lib/recruitment/db";
import { requireAdmin } from "@/lib/recruitment/auth";
import { getActiveCycle } from "@/lib/recruitment/cycle";
import { actionOk, actionErr, actionErrFromCaught, type ActionResult } from "@/lib/recruitment/actionResult";

const APPLICATION_STATUSES = ["draft", "submitted", "shortlisted", "rejected", "selected"];
const ARTIFACT_TYPES = ["none", "code_link", "code_file", "blog_link", "design_file"];

export async function setApplicationStatusAction(
  applicationId: string,
  status: string
): Promise<ActionResult<{ status: string }>> {
  try {
    await requireAdmin();
    if (!APPLICATION_STATUSES.includes(status)) return actionErr(400, "Invalid status");

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
    return actionOk({ status: application.status });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}

export async function reviewSubmissionAction(
  submissionId: string,
  input: { score: number | null; notes: string; status: string }
): Promise<
  ActionResult<{ id: string; score: number | null; reviewerNotes: string | null; status: string }>
> {
  try {
    await requireAdmin();

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: { score: input.score, reviewerNotes: input.notes, status: input.status },
    });
    return actionOk({
      id: submission.id,
      score: submission.score,
      reviewerNotes: submission.reviewerNotes,
      status: submission.status,
    });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}

export async function setDomainTaskConfigAction(
  domainName: string,
  input: { artifactType: string; artifactLabel: string | null }
): Promise<ActionResult<{ domainName: string; artifactType: string; artifactLabel: string | null }>> {
  try {
    await requireAdmin();
    const domain = await prisma.domain.findUnique({ where: { name: domainName } });
    if (!domain) return actionErr(404, "Unknown domain");
    if (!ARTIFACT_TYPES.includes(input.artifactType)) return actionErr(400, "Invalid artifact type");

    const cycle = await getActiveCycle();
    const config = await prisma.domainTaskConfig.upsert({
      where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
      update: { artifactType: input.artifactType, artifactLabel: input.artifactLabel || null },
      create: {
        cycleId: cycle.id,
        domainId: domain.id,
        artifactType: input.artifactType,
        artifactLabel: input.artifactLabel || null,
      },
    });

    return actionOk({
      domainName: domain.name,
      artifactType: config.artifactType,
      artifactLabel: config.artifactLabel,
    });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}
