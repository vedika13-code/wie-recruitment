"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { createInterviewSlotAction } from "@/lib/recruitment/actions/interview";
import { formatSlotDate, formatSlotTime } from "@/lib/recruitment/format";
import type { AdminInterviewSlot } from "@/lib/recruitment/interview";

const EMPTY_FORM = { slotDate: "", startTime: "", endTime: "", meetLink: "", capacity: "1" };

export default function InterviewSlotManager({ slots }: { slots: AdminInterviewSlot[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const result = await createInterviewSlotAction(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setForm(EMPTY_FORM);
    router.refresh();
  };

  return (
    <GlassCard className="mt-10">
      <h2 className="text-lg font-semibold text-white">Interview Slots</h2>

      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={form.slotDate}
          onChange={(e) => handleChange("slotDate", e.target.value)}
          required
          className="glass-card rounded-md px-2 py-1 text-sm text-white"
        />
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => handleChange("startTime", e.target.value)}
          required
          className="glass-card rounded-md px-2 py-1 text-sm text-white"
        />
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => handleChange("endTime", e.target.value)}
          required
          className="glass-card rounded-md px-2 py-1 text-sm text-white"
        />
        <input
          type="url"
          placeholder="Meet link"
          value={form.meetLink}
          onChange={(e) => handleChange("meetLink", e.target.value)}
          required
          className="glass-card w-40 rounded-md px-2 py-1 text-sm text-white"
        />
        <input
          type="number"
          min="1"
          value={form.capacity}
          onChange={(e) => handleChange("capacity", e.target.value)}
          required
          className="glass-card w-16 rounded-md px-2 py-1 text-sm text-white"
        />
        <Button type="submit" variant="secondary" disabled={saving}>
          {saving ? "Saving…" : "Create Slot"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-widest text-purple-300">
            <th className="pb-2">Date</th>
            <th className="pb-2">Time</th>
            <th className="pb-2">Meet Link</th>
            <th className="pb-2">Booked / Capacity</th>
            <th className="pb-2">Booked by</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.id} className="border-t border-white/10">
              <td className="py-2 text-white/90">{formatSlotDate(s.slotDate)}</td>
              <td className="py-2 text-white/90">
                {formatSlotTime(s.startTime)}–{formatSlotTime(s.endTime)}
              </td>
              <td className="py-2">
                <a
                  href={s.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 underline"
                >
                  {s.meetLink}
                </a>
              </td>
              <td className="py-2 text-white/90">
                {s.bookedCount} / {s.capacity}
              </td>
              <td className="py-2 text-white/70">
                {s.bookings.length === 0 ? "—" : s.bookings.map((b) => b.name || b.email).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
