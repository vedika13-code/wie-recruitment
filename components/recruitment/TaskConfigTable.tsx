"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { setDomainTaskConfigAction } from "@/lib/recruitment/actions/admin";
import type { DomainTaskConfigView } from "@/lib/recruitment/admin";

const ARTIFACT_TYPES = ["none", "code_link", "code_file", "blog_link", "design_file"];

function ConfigRow({ config }: { config: DomainTaskConfigView }) {
  const router = useRouter();
  const [artifactType, setArtifactType] = useState(config.artifactType);
  const [artifactLabel, setArtifactLabel] = useState(config.artifactLabel ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await setDomainTaskConfigAction(config.domainName, {
      artifactType,
      artifactLabel: artifactLabel || null,
    });
    setSaving(false);
    router.refresh();
  };

  return (
    <tr className="border-t border-white/10">
      <td className="py-3 pr-4 text-white">{config.domainName}</td>
      <td className="py-3 pr-4">
        <select
          value={artifactType}
          onChange={(e) => setArtifactType(e.target.value)}
          className="glass-card rounded-md px-2 py-1 text-sm text-white"
        >
          {ARTIFACT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 pr-4">
        <input
          value={artifactLabel}
          onChange={(e) => setArtifactLabel(e.target.value)}
          placeholder="Label shown to applicants"
          disabled={artifactType === "none"}
          className="glass-card w-full rounded-md px-2 py-1 text-sm text-white disabled:opacity-50"
        />
      </td>
      <td className="py-3">
        <Button onClick={handleSave} disabled={saving} variant="secondary">
          {saving ? "Saving…" : "Save"}
        </Button>
      </td>
    </tr>
  );
}

export default function TaskConfigTable({ configs }: { configs: DomainTaskConfigView[] }) {
  return (
    <table className="mt-6 w-full text-left text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-widest text-purple-300">
          <th className="pb-2">Domain</th>
          <th className="pb-2">Artifact type</th>
          <th className="pb-2">Label</th>
          <th className="pb-2" />
        </tr>
      </thead>
      <tbody>
        {configs.map((c) => (
          <ConfigRow key={c.domainId} config={c} />
        ))}
      </tbody>
    </table>
  );
}
