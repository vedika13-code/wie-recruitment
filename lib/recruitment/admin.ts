import "server-only";
import prisma from "./db";
import { getActiveCycle } from "./cycle";
import type { ApplicationDomain, Domain, Submission } from "@/generated/prisma";

export type AdminDomainSummary = {
  domainId: string;
  domainName: string;
  submissionId: string | null;
  submissionStatus: string;
  score: number | null;
  reviewerNotes: string | null;
  artifactType: string | null;
  artifactUrl: string | null;
};

function toDomainSummary(
  applicationDomains: (ApplicationDomain & { domain: Domain })[],
  submissions: Submission[]
): AdminDomainSummary[] {
  return applicationDomains.map((ad) => {
    const submission = submissions.find((s) => s.domainId === ad.domainId);
    return {
      domainId: ad.domainId,
      domainName: ad.domain.name,
      submissionId: submission?.id ?? null,
      submissionStatus: submission?.status ?? "in_progress",
      score: submission?.score ?? null,
      reviewerNotes: submission?.reviewerNotes ?? null,
      artifactType: submission?.artifactType ?? null,
      artifactUrl: submission?.artifactUrl ?? null,
    };
  });
}

export type AdminApplicationSummary = {
  applicationId: string;
  status: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    branch: string | null;
  };
  domains: AdminDomainSummary[];
};

export async function listApplications(filters: {
  domain?: string;
  status?: string;
}): Promise<AdminApplicationSummary[]> {
  const cycle = await getActiveCycle();
  const applications = await prisma.application.findMany({
    where: {
      cycleId: cycle.id,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.domain
        ? { applicationDomains: { some: { domain: { name: filters.domain } } } }
        : {}),
    },
    include: {
      user: true,
      applicationDomains: { include: { domain: true } },
      submissions: true,
    },
  });

  return applications.map((application) => ({
    applicationId: application.id,
    status: application.status,
    user: {
      id: application.user.id,
      name: application.user.name,
      email: application.user.email,
      phone: application.user.phone,
      branch: application.user.branch,
    },
    domains: toDomainSummary(application.applicationDomains, application.submissions),
  }));
}

export type AdminApplicationDetail = Omit<AdminApplicationSummary, "domains"> & {
  domains: (AdminDomainSummary & { answers: { question: string; answer: string | null }[] })[];
};

export async function getApplicationDetail(id: string): Promise<AdminApplicationDetail | null> {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: true,
      applicationDomains: { include: { domain: true } },
      submissions: true,
      answers: { include: { taskQuestion: true } },
    },
  });
  if (!application) return null;

  const domains = toDomainSummary(application.applicationDomains, application.submissions).map(
    (d) => ({
      ...d,
      answers: application.answers
        .filter((a) => a.taskQuestion.domainId === d.domainId)
        .sort((a, b) => a.taskQuestion.order - b.taskQuestion.order)
        .map((a) => ({ question: a.taskQuestion.questionText, answer: a.answerText })),
    })
  );

  return {
    applicationId: application.id,
    status: application.status,
    user: {
      id: application.user.id,
      name: application.user.name,
      email: application.user.email,
      phone: application.user.phone,
      branch: application.user.branch,
    },
    domains,
  };
}

export type DomainTaskConfigView = {
  domainId: string;
  domainName: string;
  artifactType: string;
  artifactLabel: string | null;
};

export async function getDomainTaskConfigs(): Promise<DomainTaskConfigView[]> {
  const cycle = await getActiveCycle();
  const domains = await prisma.domain.findMany({ orderBy: { name: "asc" } });
  const configs = await prisma.domainTaskConfig.findMany({ where: { cycleId: cycle.id } });
  const configByDomain = Object.fromEntries(configs.map((c) => [c.domainId, c]));

  return domains.map((d) => ({
    domainId: d.id,
    domainName: d.name,
    artifactType: configByDomain[d.id]?.artifactType ?? "none",
    artifactLabel: configByDomain[d.id]?.artifactLabel ?? null,
  }));
}
