import Link from "next/link";
import { getActiveCycle } from "@/lib/recruitment/cycle";
import Countdown from "@/components/recruitment/Countdown";
import Button from "@/components/ui/Button";

export default async function HomePage() {
  let applicationDeadline: Date | null = null;
  try {
    const cycle = await getActiveCycle();
    applicationDeadline = cycle.applicationDeadline;
  } catch {
    applicationDeadline = null;
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-white">IEEE Women in Engineering</h1>
      <p className="mt-4 text-white/70">
        Join a global network of innovators, leaders, and changemakers.
      </p>

      {applicationDeadline && (
        <div className="mt-6">
          <Countdown deadline={applicationDeadline} label="Applications close in" />
        </div>
      )}

      <Link href="/profile" className="mt-8 inline-block">
        <Button>Apply Now</Button>
      </Link>
    </main>
  );
}
