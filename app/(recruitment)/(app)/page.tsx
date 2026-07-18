import GlassCard from "@/components/ui/GlassCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";

export default function RecruitmentHome() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <SectionTitle eyebrow="IEEE WIE" title="Recruitment portal scaffold" />
      <GlassCard className="mt-8">
        <p className="text-white/80">
          If this card has a soft purple glow, a blurred glass background, and lifts on
          hover, the shared design system is wired up correctly.
        </p>
        <Button className="mt-6">Example button</Button>
      </GlassCard>
    </main>
  );
}
