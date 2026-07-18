import { getDomainTaskConfigs } from "@/lib/recruitment/admin";
import SectionTitle from "@/components/ui/SectionTitle";
import TaskConfigTable from "@/components/recruitment/TaskConfigTable";

export default async function AdminTaskConfigPage() {
  const configs = await getDomainTaskConfigs();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionTitle eyebrow="Admin" title="Task Config" />
      <p className="mt-4 text-white/70">
        Turn a domain&apos;s work-artifact requirement on/off and pick its type, for the
        active cycle.
      </p>
      <TaskConfigTable configs={configs} />
    </main>
  );
}
