import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";

type Props = {
  title: string;
  status: "available" | "locked";
  path: string;
};

// Replaces Card.jsx. Important carried-over lesson (docs/ROADMAP.md Stretch 7): a
// locked card must render as a plain, non-navigating element — not a <Link> that's
// merely styled to look disabled — otherwise it's a real navigation dead-end even
// once the underlying condition unlocks, the way the old hardcoded "locked" Interview
// card was until this exact bug was caught.
export default function StatusCard({ title, status, path }: Props) {
  const badge = (
    <span className="text-xs font-semibold uppercase tracking-widest text-purple-300">
      {status === "available" ? "Available" : "Locked"}
    </span>
  );

  if (status === "locked") {
    return (
      <GlassCard className="opacity-50">
        {badge}
        <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      </GlassCard>
    );
  }

  return (
    <Link href={path}>
      <GlassCard className="cursor-pointer">
        {badge}
        <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      </GlassCard>
    </Link>
  );
}
