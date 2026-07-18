"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { bookInterviewSlotAction } from "@/lib/recruitment/actions/interview";
import { formatSlotDate, formatSlotTime } from "@/lib/recruitment/format";
import type { InterviewSlotView } from "@/lib/recruitment/interview";

export default function SlotList({ slots }: { slots: InterviewSlotView[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  const handleBook = async (slotId: string) => {
    setError("");
    setBooking(true);
    const result = await bookInterviewSlotAction(slotId);
    setBooking(false);
    if (!result.ok) {
      setError(result.message);
      router.refresh(); // someone else may have just taken the last seat
      return;
    }
    router.refresh();
  };

  if (slots.length === 0) {
    return <p className="text-white/70">No interview slots have been created yet.</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      {slots.map((slot) => {
        const remaining = slot.capacity - slot.bookedCount;
        const full = remaining <= 0;
        return (
          <GlassCard key={slot.id}>
            <p className="font-semibold text-white">
              {formatSlotDate(slot.slotDate)} · {formatSlotTime(slot.startTime)}–
              {formatSlotTime(slot.endTime)}
            </p>
            <p className="mt-1 text-sm text-white/70">
              {full ? "Unavailable" : `${remaining} of ${slot.capacity} spots left`}
            </p>
            <Button
              onClick={() => handleBook(slot.id)}
              disabled={full || booking}
              variant="secondary"
              className="mt-3"
            >
              {full ? "Unavailable" : booking ? "Booking…" : "Book this slot"}
            </Button>
          </GlassCard>
        );
      })}
    </div>
  );
}
