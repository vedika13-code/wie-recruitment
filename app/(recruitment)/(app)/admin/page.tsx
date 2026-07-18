import Link from "next/link";
import { listApplications } from "@/lib/recruitment/admin";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import AdminFilters from "@/components/recruitment/AdminFilters";

const DOMAIN_NAMES = ["Technical", "Projects", "Management", "Editorial", "Design", "Publicity"];
const STATUS_OPTIONS = ["draft", "submitted", "shortlisted", "rejected", "selected"];

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; status?: string }>;
}) {
  const { domain, status } = await searchParams;
  const applications = await listApplications({ domain, status });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <SectionTitle eyebrow="Admin" title="Applications" />

      <AdminFilters
        domainNames={DOMAIN_NAMES}
        statusOptions={STATUS_OPTIONS}
        domain={domain ?? ""}
        status={status ?? ""}
      />

      <div className="mt-6 space-y-3">
        {applications.map((app) => (
          <Link key={app.applicationId} href={`/admin/applications/${app.applicationId}`}>
            <GlassCard className="cursor-pointer">
              <p className="font-semibold text-white">
                {app.user.name || app.user.email} — {app.status}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {app.domains.map((d) => (
                  <span key={d.domainId} className="text-xs text-white/70">
                    {d.domainName} ({d.submissionStatus})
                  </span>
                ))}
              </div>
            </GlassCard>
          </Link>
        ))}
        {applications.length === 0 && (
          <p className="text-white/70">No applications match these filters.</p>
        )}
      </div>
    </main>
  );
}
