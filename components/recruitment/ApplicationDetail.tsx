"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { setApplicationStatusAction, reviewSubmissionAction } from "@/lib/recruitment/actions/admin";
import type { AdminApplicationDetail } from "@/lib/recruitment/admin";

const STATUS_OPTIONS = ["draft", "submitted", "shortlisted", "rejected", "selected"];

function DomainReview({ domain }: { domain: AdminApplicationDetail["domains"][number] }) {
  const router = useRouter();
  const [score, setScore] = useState(domain.score?.toString() ?? "");
  const [notes, setNotes] = useState(domain.reviewerNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!domain.submissionId) return;
    setSaving(true);
    const result = await reviewSubmissionAction(domain.submissionId, {
      score: score === "" ? null : Number(score),
      notes,
      status: "reviewed",
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage("Review saved.");
    router.refresh();
  };

  return (
    <GlassCard className="mt-4">
      <h3 className="font-semibold text-white">
        {domain.domainName} — {domain.submissionStatus}
      </h3>

      <div className="mt-3 space-y-2">
        {domain.answers.map((a, i) => (
          <div key={i} className="text-sm">
            <p className="font-medium text-white/90">{a.question}</p>
            <p className="text-white/70">{a.answer || "(no answer)"}</p>
          </div>
        ))}
      </div>

      {domain.artifactUrl && (
        <p className="mt-3 text-sm text-white/80">
          Artifact:{" "}
          <a
            href={domain.artifactUrl}
            target="_blank"
            rel="noreferrer"
            className="text-purple-300 underline"
          >
            {domain.artifactUrl}
          </a>
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm text-white/70">Score:</label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="glass-card w-20 rounded-md px-2 py-1 text-sm text-white"
        />
      </div>

      <div className="mt-3">
        <label className="text-sm text-white/70">Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="glass-card mt-1 w-full rounded-md px-3 py-2 text-sm text-white"
        />
      </div>

      {message && <p className="mt-2 text-sm text-purple-300">{message}</p>}

      <Button
        onClick={handleSave}
        disabled={!domain.submissionId || saving}
        variant="secondary"
        className="mt-3"
      >
        {saving ? "Saving…" : "Save Review"}
      </Button>
    </GlassCard>
  );
}

export default function ApplicationDetail({ detail }: { detail: AdminApplicationDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState(detail.status);
  const [message, setMessage] = useState("");

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    const result = await setApplicationStatusAction(detail.applicationId, newStatus);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage("Status updated.");
    router.refresh();
  };

  return (
    <div className="mt-6">
      <p className="text-white/70">
        {detail.user.email} · {detail.user.phone} · {detail.user.branch}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm text-white/70">Application status:</label>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="glass-card rounded-md px-3 py-2 text-sm text-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="mt-2 text-sm text-purple-300">{message}</p>}

      {detail.domains.map((d) => (
        // Keyed on applicationId+domainId (not just domainId) — otherwise navigating
        // between two applicants who both selected the same domain would reuse this
        // component instance and leak the previous applicant's draft score/notes into
        // the new one (same class of bug the TaskForm key={domainName} fix addressed).
        <DomainReview key={`${detail.applicationId}-${d.domainId}`} domain={d} />
      ))}
    </div>
  );
}
