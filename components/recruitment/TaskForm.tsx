"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import {
  saveAnswersAction,
  saveArtifactAction,
  submitTaskAction,
  getNextTaskPathAction,
} from "@/lib/recruitment/actions/tasks";
import type { TaskData } from "@/lib/recruitment/tasks";

const LINK_ARTIFACT_TYPES = ["code_link", "blog_link"];
const FILE_ARTIFACT_TYPES = ["code_file", "design_file"];

type Props = {
  domainName: string;
  data: TaskData;
  taskClosed: boolean;
};

const inputClass =
  "glass-card mt-3 w-full rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 disabled:opacity-50";

export default function TaskForm({ domainName, data, taskClosed }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(data.questions.map((q) => [q.id, q.answerText]))
  );
  const [artifactUrlInput, setArtifactUrlInput] = useState("");
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const existingArtifactUrl = data.submission?.artifactUrl ?? null;

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    const answersResult = await saveAnswersAction(
      domainName,
      Object.entries(answers).map(([questionId, text]) => ({ questionId, text }))
    );
    if (!answersResult.ok) {
      setError(answersResult.message);
      setSubmitting(false);
      return;
    }

    if (LINK_ARTIFACT_TYPES.includes(data.artifactConfig.type)) {
      if (artifactUrlInput) {
        const fd = new FormData();
        fd.set("url", artifactUrlInput);
        const result = await saveArtifactAction(domainName, fd);
        if (!result.ok) {
          setError(result.message);
          setSubmitting(false);
          return;
        }
      } else if (!existingArtifactUrl) {
        setError(`Please provide: ${data.artifactConfig.label}`);
        setSubmitting(false);
        return;
      }
    } else if (FILE_ARTIFACT_TYPES.includes(data.artifactConfig.type)) {
      if (artifactFile) {
        const fd = new FormData();
        fd.set("file", artifactFile);
        const result = await saveArtifactAction(domainName, fd);
        if (!result.ok) {
          setError(result.message);
          setSubmitting(false);
          return;
        }
      } else if (!existingArtifactUrl) {
        setError(`Please provide: ${data.artifactConfig.label}`);
        setSubmitting(false);
        return;
      }
    }

    const submitResult = await submitTaskAction(domainName);
    if (!submitResult.ok) {
      setError(submitResult.message);
      setSubmitting(false);
      return;
    }

    const nextPathResult = await getNextTaskPathAction();
    router.push(nextPathResult.ok ? nextPathResult.data.path : "/interview");
  };

  return (
    <div>
      <div className="space-y-6">
        {data.questions.map((q, i) => (
          <div key={q.id}>
            <p className="text-sm text-white/90">
              <span className="font-semibold">{i + 1}.</span> {q.questionText}
            </p>
            <textarea
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              rows={3}
              disabled={taskClosed}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {data.artifactConfig.type !== "none" && (
        <div className="glass-card mt-8 rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Also provide: {data.artifactConfig.label}
          </p>

          {LINK_ARTIFACT_TYPES.includes(data.artifactConfig.type) && (
            <input
              type="url"
              placeholder={data.artifactConfig.label ?? ""}
              value={artifactUrlInput}
              onChange={(e) => setArtifactUrlInput(e.target.value)}
              disabled={taskClosed}
              className={inputClass}
            />
          )}

          {FILE_ARTIFACT_TYPES.includes(data.artifactConfig.type) && (
            <>
              <input
                type="file"
                onChange={(e) => setArtifactFile(e.target.files?.[0] ?? null)}
                disabled={taskClosed}
                className="mt-3 text-sm text-white/80"
              />
              {existingArtifactUrl && !artifactFile && (
                <p className="mt-2 text-sm text-white/70">
                  Current file:{" "}
                  <a
                    href={existingArtifactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-300 underline"
                  >
                    view
                  </a>
                </p>
              )}
            </>
          )}

          {existingArtifactUrl &&
            LINK_ARTIFACT_TYPES.includes(data.artifactConfig.type) &&
            !artifactUrlInput && (
              <p className="mt-2 text-sm text-white/70">Currently saved: {existingArtifactUrl}</p>
            )}
        </div>
      )}

      {taskClosed && (
        <p className="mt-6 text-sm text-red-400">
          The task deadline has passed — submissions are locked.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || taskClosed} className="mt-8">
        {submitting ? "Submitting…" : "Submit"}
      </Button>
    </div>
  );
}
