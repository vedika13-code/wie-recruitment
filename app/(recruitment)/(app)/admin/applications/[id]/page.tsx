import { notFound } from "next/navigation";
import { getApplicationDetail } from "@/lib/recruitment/admin";
import SectionTitle from "@/components/ui/SectionTitle";
import ApplicationDetail from "@/components/recruitment/ApplicationDetail";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getApplicationDetail(id);
  if (!detail) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionTitle eyebrow="Admin" title={detail.user.name || detail.user.email} />
      <ApplicationDetail detail={detail} />
    </main>
  );
}
