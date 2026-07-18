import { getSession } from "@/lib/recruitment/auth";
import { listAdmins } from "@/lib/recruitment/actions/admins";
import SectionTitle from "@/components/ui/SectionTitle";
import ManageAdminsTable from "@/components/recruitment/ManageAdminsTable";

export default async function ManageAdminsPage() {
  const user = (await getSession())!;
  const admins = await listAdmins();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionTitle eyebrow="Super Admin" title="Manage Admins" />
      <p className="mt-4 text-white/70">
        Add a new admin by college email — works even if they haven&apos;t signed in yet.
      </p>
      <ManageAdminsTable admins={admins} selfId={user.id} />
    </main>
  );
}
