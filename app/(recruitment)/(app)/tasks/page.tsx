import Link from "next/link";
import { getSession } from "@/lib/recruitment/auth";
import { getDomainsWithHeads, getSelectedDomainIds } from "@/lib/recruitment/domains";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";

export default async function TasksPage() {
  const user = (await getSession())!;
  const domains = await getDomainsWithHeads();

  let selectedIds: string[] = [];
  try {
    selectedIds = await getSelectedDomainIds(user.id);
  } catch {
    // No active cycle — nothing selected yet.
  }

  const selectedDomains = domains.filter((d) => selectedIds.includes(d.id));

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionTitle eyebrow="Applicant" title="Your Tasks" />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {selectedDomains.length > 0 ? (
          selectedDomains.map((d) => (
            <Link key={d.id} href={`/tasks/${d.name}`}>
              <GlassCard className="cursor-pointer">
                <h3 className="text-lg font-semibold text-white">{d.name}</h3>
                <p className="mt-2 text-sm text-white/70">Click to attempt questions</p>
              </GlassCard>
            </Link>
          ))
        ) : (
          <p className="text-white/70">No domains selected.</p>
        )}
      </div>
    </main>
  );
}
