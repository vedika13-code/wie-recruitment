import { notFound } from "next/navigation";
import { getSession } from "@/lib/recruitment/auth";
import { getTaskData } from "@/lib/recruitment/tasks";
import { getActiveCycle } from "@/lib/recruitment/cycle";
import { isPast } from "@/lib/recruitment/format";
import SectionTitle from "@/components/ui/SectionTitle";
import TaskForm from "@/components/recruitment/TaskForm";

export default async function TaskQuestionsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainName } = await params;
  const user = (await getSession())!;

  const data = await getTaskData(domainName, user.id);
  if (!data) notFound();

  let taskClosed = false;
  try {
    const cycle = await getActiveCycle();
    taskClosed = isPast(cycle.taskDeadline);
  } catch {
    taskClosed = false;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionTitle eyebrow={domainName} title={`${domainName} Domain Questions`} />
      <div className="mt-8">
        {/* key={domainName} forces a remount on domain change — replaces the manual
            useEffect state-reset workaround the CRA version needed (React Router
            reused the same component instance across /tasks/:domain param changes). */}
        <TaskForm key={domainName} domainName={domainName} data={data} taskClosed={taskClosed} />
      </div>
    </main>
  );
}
