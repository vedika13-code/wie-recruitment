"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { setSelectedDomainsAction } from "@/lib/recruitment/actions/domains";

const MAX_DOMAINS = 2;

type Props = {
  domains: { id: string; name: string }[];
  initialSelectedIds: string[];
  applicationClosed: boolean;
};

export default function DomainSelector({ domains, initialSelectedIds, applicationClosed }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    if (applicationClosed) return;
    setMessage("");
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((d) => d !== id);
      if (prev.length >= MAX_DOMAINS) {
        setMessage(`You can select at most ${MAX_DOMAINS} domains.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleConfirm = async () => {
    if (selected.length === 0) {
      setMessage("Please select at least one domain.");
      return;
    }
    setSaving(true);
    const result = await setSelectedDomainsAction(selected);
    setSaving(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {domains.map((d) => {
          const isSelected = selected.includes(d.id);
          return (
            <GlassCard
              key={d.id}
              onClick={() => toggle(d.id)}
              className={`cursor-pointer text-center transition ${
                isSelected ? "glow-border" : ""
              }`}
            >
              <h3 className="text-lg font-semibold text-white">{d.name}</h3>
              {isSelected && <p className="mt-2 text-xs text-purple-300">Selected</p>}
            </GlassCard>
          );
        })}
      </div>

      {applicationClosed && (
        <p className="mt-6 text-sm text-red-400">
          Applications are closed — domain selection is locked.
        </p>
      )}
      {message && <p className="mt-4 text-sm text-red-400">{message}</p>}

      <Button
        onClick={handleConfirm}
        disabled={applicationClosed || saving}
        className="mt-8"
      >
        {saving ? "Saving…" : "Confirm Selection"}
      </Button>
    </div>
  );
}
