"use server";

import prisma from "@/lib/recruitment/db";
import { requireAuth } from "@/lib/recruitment/auth";
import { getOrCreateApplication, assertActiveCycleDeadline } from "@/lib/recruitment/cycle";
import { findDomainByName, getSubmittedDomainIds } from "@/lib/recruitment/tasks";
import { getSelectedDomainIds } from "@/lib/recruitment/domains";
import { artifactStorage } from "@/lib/recruitment/storage";
import { actionOk, actionErr, actionErrFromCaught, type ActionResult } from "@/lib/recruitment/actionResult";

const LINK_ARTIFACT_TYPES = ["code_link", "blog_link"];
const FILE_ARTIFACT_TYPES = ["code_file", "design_file"];

export async function saveAnswersAction(
  domainName: string,
  answers: { questionId: string; text: string }[]
): Promise<ActionResult<{ saved: true }>> {
  try {
    const user = await requireAuth();
    const domain = await findDomainByName(domainName);
    if (!domain) return actionErr(404, "Unknown domain");

    const cycle = await assertActiveCycleDeadline("taskDeadline");
    const validQuestions = await prisma.taskQuestion.findMany({
      where: { cycleId: cycle.id, domainId: domain.id },
      select: { id: true },
    });
    const validIds = new Set(validQuestions.map((q) => q.id));
    for (const a of answers) {
      if (!validIds.has(a.questionId)) return actionErr(400, "Invalid question for this domain");
    }

    const application = await getOrCreateApplication(user.id, cycle.id);
    await Promise.all(
      answers.map((a) =>
        prisma.answer.upsert({
          where: {
            applicationId_taskQuestionId: {
              applicationId: application.id,
              taskQuestionId: a.questionId,
            },
          },
          update: { answerText: a.text },
          create: {
            applicationId: application.id,
            taskQuestionId: a.questionId,
            answerText: a.text,
          },
        })
      )
    );
    return actionOk({ saved: true });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}

export async function saveArtifactAction(
  domainName: string,
  formData: FormData
): Promise<ActionResult<{ artifactType: string | null; artifactUrl: string | null }>> {
  try {
    const user = await requireAuth();
    const domain = await findDomainByName(domainName);
    if (!domain) return actionErr(404, "Unknown domain");

    const cycle = await assertActiveCycleDeadline("taskDeadline");
    const config = await prisma.domainTaskConfig.findUnique({
      where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
    });
    const artifactType = config?.artifactType ?? "none";
    if (artifactType === "none") {
      return actionErr(400, "This domain does not require an artifact");
    }

    let artifactUrl: string;
    if (LINK_ARTIFACT_TYPES.includes(artifactType)) {
      const url = formData.get("url");
      if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
        return actionErr(400, "A valid http(s) URL is required");
      }
      artifactUrl = url;
    } else if (FILE_ARTIFACT_TYPES.includes(artifactType)) {
      const file = formData.get("file");
      if (!(file instanceof File) || file.size === 0) {
        return actionErr(400, "A file is required");
      }
      artifactUrl = await artifactStorage.save(file);
    } else {
      return actionErr(400, "Unknown artifact type");
    }

    const application = await getOrCreateApplication(user.id, cycle.id);
    const submission = await prisma.submission.upsert({
      where: { applicationId_domainId: { applicationId: application.id, domainId: domain.id } },
      update: { artifactType, artifactUrl },
      create: { applicationId: application.id, domainId: domain.id, artifactType, artifactUrl },
    });

    return actionOk({ artifactType: submission.artifactType, artifactUrl: submission.artifactUrl });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}

export async function submitTaskAction(domainName: string): Promise<ActionResult<{ status: string }>> {
  try {
    const user = await requireAuth();
    const domain = await findDomainByName(domainName);
    if (!domain) return actionErr(404, "Unknown domain");

    const cycle = await assertActiveCycleDeadline("taskDeadline");
    const config = await prisma.domainTaskConfig.findUnique({
      where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
    });
    const application = await getOrCreateApplication(user.id, cycle.id);

    const existing = await prisma.submission.findUnique({
      where: { applicationId_domainId: { applicationId: application.id, domainId: domain.id } },
    });

    const requiresArtifact = config != null && config.artifactType !== "none";
    if (requiresArtifact && !existing?.artifactUrl) {
      return actionErr(400, "Please provide the required artifact before submitting");
    }

    const submission = await prisma.submission.upsert({
      where: { applicationId_domainId: { applicationId: application.id, domainId: domain.id } },
      update: { status: "submitted", submittedAt: new Date() },
      create: {
        applicationId: application.id,
        domainId: domain.id,
        status: "submitted",
        submittedAt: new Date(),
      },
    });

    return actionOk({ status: submission.status });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}

// Ports the client-side "advance to next domain or Interview" logic from the old
// TaskQuestions.jsx into a single server round-trip instead of 3 separate API calls.
export async function getNextTaskPathAction(): Promise<ActionResult<{ path: string }>> {
  try {
    const user = await requireAuth();
    const [domains, selectedIds, submittedIds] = await Promise.all([
      prisma.domain.findMany(),
      getSelectedDomainIds(user.id),
      getSubmittedDomainIds(user.id),
    ]);

    const selectedNames = domains.filter((d) => selectedIds.includes(d.id)).map((d) => d.name);
    const submittedNames = domains.filter((d) => submittedIds.includes(d.id)).map((d) => d.name);
    const remaining = selectedNames.filter((name) => !submittedNames.includes(name));

    return actionOk({ path: remaining.length > 0 ? `/tasks/${remaining[0]}` : "/interview" });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}
