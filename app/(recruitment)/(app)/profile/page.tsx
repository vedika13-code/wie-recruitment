import { getSession } from "@/lib/recruitment/auth";
import { getActiveCycle } from "@/lib/recruitment/cycle";
import { isPast } from "@/lib/recruitment/format";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import ProfileForm from "@/components/recruitment/ProfileForm";

export default async function ProfilePage() {
  // (app)/layout.tsx already enforces sign-in; getSession() here just re-fetches the
  // full profile fields (AuthProvider's context only carries id/email/name/role).
  const user = (await getSession())!;

  // Matches the original app's behavior: if there's no active cycle at all, editing
  // stays open rather than blocked — this only matters between recruitment cycles.
  let applicationClosed = false;
  try {
    const cycle = await getActiveCycle();
    applicationClosed = isPast(cycle.applicationDeadline);
  } catch {
    applicationClosed = false;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionTitle eyebrow="Applicant" title="Profile" />
      <GlassCard className="mt-8">
        <ProfileForm
          email={user.email}
          initial={{
            name: user.name ?? "",
            phone: user.phone ?? "",
            regNo: user.regNo ?? "",
            branch: user.branch ?? "",
            specialization: user.specialization ?? "",
            age: user.age?.toString() ?? "",
            residenceType: user.residenceType ?? "",
            githubUrl: user.githubUrl ?? "",
            linkedinUrl: user.linkedinUrl ?? "",
            portfolioUrl: user.portfolioUrl ?? "",
          }}
          applicationClosed={applicationClosed}
        />
      </GlassCard>
    </main>
  );
}
