"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

type Props = {
  deadline: string | Date | null;
  label: string;
};

export default function Countdown({ deadline, label }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!deadline) return null;

  const remaining = formatRemaining(new Date(deadline).getTime() - now.getTime());

  if (!remaining) {
    return <p className="text-sm font-medium text-red-400">{label} — closed</p>;
  }

  return (
    <p className="text-sm font-medium text-purple-300">
      {label}: {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
    </p>
  );
}
