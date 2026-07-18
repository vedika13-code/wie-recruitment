import Link from "next/link";
import { getActiveCycle } from "@/lib/recruitment/cycle";
import Countdown from "@/components/recruitment/Countdown";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";

const DOMAINS = [
  { name: "Technical", blurb: "Build and develop projects" },
  { name: "Projects", blurb: "Work on innovative ideas" },
  { name: "Management", blurb: "Organize and lead events" },
  { name: "Editorial", blurb: "Content and writing" },
  { name: "Design", blurb: "Visual and UI design" },
  { name: "Publicity", blurb: "Social media and outreach" },
];

const INSTRUCTIONS = [
  "Fill your profile details carefully",
  "Select a maximum of 2 domains",
  "Complete assigned tasks",
  "Upload your submissions before deadline",
];

export default async function ApplyPage() {
  let applicationDeadline: Date | null = null;
  try {
    const cycle = await getActiveCycle();
    applicationDeadline = cycle.applicationDeadline;
  } catch {
    applicationDeadline = null;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionTitle eyebrow="IEEE WIE" title="Recruitment 2026" />
      <p className="mt-4 text-white/70">
        Join a community of innovators, leaders, and changemakers. IEEE Women in
        Engineering provides a platform to learn, collaborate, and grow.
      </p>

      {applicationDeadline && (
        <div className="mt-6">
          <Countdown deadline={applicationDeadline} label="Applications close in" />
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Domains</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {DOMAINS.map((d) => (
              <li key={d.name}>
                <span className="font-medium text-white">{d.name}</span> — {d.blurb}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Instructions</h2>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-white/80">
            {INSTRUCTIONS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <Link href="/profile" className="mt-10 inline-block">
        <Button>Start Application</Button>
      </Link>
    </main>
  );
}
