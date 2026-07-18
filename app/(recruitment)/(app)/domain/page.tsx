import { getSession } from "@/lib/recruitment/auth";
import { getDomainsWithHeads, getSelectedDomainIds } from "@/lib/recruitment/domains";
import { getActiveCycle } from "@/lib/recruitment/cycle";
import { isPast } from "@/lib/recruitment/format";
import SectionTitle from "@/components/ui/SectionTitle";
import DomainSelector from "@/components/recruitment/DomainSelector";

export default async function DomainPage() {
  const user = (await getSession())!;
  const domains = await getDomainsWithHeads();

  let selectedIds: string[] = [];
  let applicationClosed = false;
  try {
    const cycle = await getActiveCycle();
    applicationClosed = isPast(cycle.applicationDeadline);
    selectedIds = await getSelectedDomainIds(user.id);
  } catch {
    // No active cycle — nothing selected yet, editing stays open (matches Profile).
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <SectionTitle eyebrow="Applicant" title="Select up to 2 Domains" />
      <div className="mt-8">
        <DomainSelector
          domains={domains.map((d) => ({ id: d.id, name: d.name }))}
          initialSelectedIds={selectedIds}
          applicationClosed={applicationClosed}
        />
      </div>
    </main>
  );
}
