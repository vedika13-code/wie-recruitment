import { getSession } from "@/lib/recruitment/auth";
import { getDashboardData } from "@/lib/recruitment/dashboard";
import { isInterviewUnlocked } from "@/lib/recruitment/interviewStatus";
import Countdown from "@/components/recruitment/Countdown";
import StatusCard from "@/components/recruitment/StatusCard";

export default async function DashboardPage() {
  const user = (await getSession())!;
  const data = await getDashboardData(user.id, user.name);

  // "Has a profile" means "has actually filled in the required name field" — the
  // session/profile row always exists once signed in, so this can't rely on the row
  // itself being present the way a localStorage check naturally could.
  const hasProfile = Boolean(data.profile.name);

  const cards: { title: string; status: "available" | "locked"; path: string }[] = [
    { title: "Profile", status: "available", path: "/profile" },
    { title: "Domain Selection", status: hasProfile ? "available" : "locked", path: "/domain" },
    {
      title: "Tasks",
      status: data.selectedDomains.length > 0 ? "available" : "locked",
      path: "/tasks",
    },
    {
      title: "Interview",
      status: isInterviewUnlocked(data.applicationStatus) ? "available" : "locked",
      path: "/interview",
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      <div className="mt-4">
        <Countdown deadline={data.cycle.applicationDeadline} label="Applications close in" />
      </div>

      {hasProfile && (
        <p className="mt-6 text-white/80">
          Welcome, <span className="font-semibold text-white">{data.profile.name}</span>
        </p>
      )}

      {data.selectedDomains.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Your Selected Domains
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.selectedDomains.map((name) => (
              <span
                key={name}
                className="glass-card rounded-full px-3 py-1 text-sm text-white/90"
              >
                {name}
                {data.submittedDomains.includes(name) ? " (submitted)" : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <StatusCard key={c.title} {...c} />
        ))}
      </div>
    </main>
  );
}
