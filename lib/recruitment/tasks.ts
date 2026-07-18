import "server-only";
import prisma from "./db";
import { getActiveCycle } from "./cycle";

export type TaskQuestionView = {
  id: string;
  questionText: string;
  order: number;
  answerText: string;
};

export type TaskData = {
  domain: { id: string; name: string };
  artifactConfig: { type: string; label: string | null };
  questions: TaskQuestionView[];
  submission: { artifactType: string | null; artifactUrl: string | null; status: string } | null;
};

export function findDomainByName(name: string) {
  return prisma.domain.findUnique({ where: { name } });
}

export async function getTaskData(domainName: string, userId: string): Promise<TaskData | null> {
  const domain = await findDomainByName(domainName);
  if (!domain) return null;

  const cycle = await getActiveCycle();
  const config = await prisma.domainTaskConfig.findUnique({
    where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
  });
  const questions = await prisma.taskQuestion.findMany({
    where: { cycleId: cycle.id, domainId: domain.id },
    orderBy: { order: "asc" },
  });

  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId } },
  });

  let answerByQuestion: Record<string, string> = {};
  let submission = null;
  if (application) {
    const answers = await prisma.answer.findMany({
      where: {
        applicationId: application.id,
        taskQuestionId: { in: questions.map((q) => q.id) },
      },
    });
    answerByQuestion = Object.fromEntries(
      answers.map((a) => [a.taskQuestionId, a.answerText ?? ""])
    );
    submission = await prisma.submission.findUnique({
      where: { applicationId_domainId: { applicationId: application.id, domainId: domain.id } },
    });
  }

  return {
    domain: { id: domain.id, name: domain.name },
    artifactConfig: { type: config?.artifactType ?? "none", label: config?.artifactLabel ?? null },
    questions: questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      order: q.order,
      answerText: answerByQuestion[q.id] ?? "",
    })),
    submission: submission
      ? {
          artifactType: submission.artifactType,
          artifactUrl: submission.artifactUrl,
          status: submission.status,
        }
      : null,
  };
}

// Domain ids (not names) of domains this applicant has a "submitted" Submission for.
export async function getSubmittedDomainIds(userId: string): Promise<string[]> {
  const cycle = await getActiveCycle();
  const application = await prisma.application.findUnique({
    where: { cycleId_userId: { cycleId: cycle.id, userId } },
  });
  if (!application) return [];

  const submitted = await prisma.submission.findMany({
    where: { applicationId: application.id, status: "submitted" },
    select: { domainId: true },
  });
  return submitted.map((s) => s.domainId);
}
