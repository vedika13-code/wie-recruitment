import { getSession } from "@/lib/recruitment/auth";
import { getInterviewPageData } from "@/lib/recruitment/interview";
import { formatSlotDate, formatSlotTime } from "@/lib/recruitment/format";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";
import SlotList from "@/components/recruitment/SlotList";

export default async function InterviewPage() {
  const user = (await getSession())!;
  const data = await getInterviewPageData(user.id);

  if (!data.unlocked) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <SectionTitle eyebrow="Applicant" title="Interview" />
        <GlassCard className="mt-8">
          <h2 className="text-xl text-white">🔒 Locked</h2>
          <p className="mt-2 text-white/70">
            You can access this section once a chapter representative reviews your tasks.
          </p>
        </GlassCard>
      </main>
    );
  }

  if (data.booking) {
    const b = data.booking;
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <SectionTitle eyebrow="Applicant" title="Interview" />
        <GlassCard className="mt-8 glow-border">
          <h2 className="text-xl text-white">You&apos;re booked</h2>
          <p className="mt-2 text-white/80">
            {formatSlotDate(b.slotDate)} · {formatSlotTime(b.startTime)}–
            {formatSlotTime(b.endTime)}
          </p>
          <p className="mt-2">
            <a
              href={b.meetLink}
              target="_blank"
              rel="noreferrer"
              className="text-purple-300 underline"
            >
              {b.meetLink}
            </a>
          </p>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <SectionTitle eyebrow="Applicant" title="Interview — Pick a Slot" />
      <div className="mt-8">
        <SlotList slots={data.availableSlots} />
      </div>
    </main>
  );
}
