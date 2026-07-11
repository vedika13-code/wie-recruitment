import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getTask,
  saveTaskAnswers,
  submitTaskArtifactLink,
  submitTaskArtifactFile,
  submitTask,
  getDomains,
  getSelectedDomains,
  getTaskProgress,
  getActiveCycle,
} from "../api";
import { isPast } from "../utils";

const LINK_ARTIFACT_TYPES = ["code_link", "blog_link"];
const FILE_ARTIFACT_TYPES = ["code_file", "design_file"];

function TaskQuestions() {
  const { domain } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(null);
  const [artifactConfig, setArtifactConfig] = useState({ type: "none", label: null });
  const [existingArtifactUrl, setExistingArtifactUrl] = useState(null);
  const [answers, setAnswers] = useState({});
  const [artifactUrlInput, setArtifactUrlInput] = useState("");
  const [artifactFile, setArtifactFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [taskClosed, setTaskClosed] = useState(false);

  useEffect(() => {
    // Router reuses this component instance across /tasks/:domain param changes, so
    // state from the previous domain must be reset explicitly here, not just re-fetched.
    setError("");
    setSubmitting(false);
    setArtifactUrlInput("");
    setArtifactFile(null);

    getActiveCycle().then((cycle) => setTaskClosed(isPast(cycle.taskDeadline)));

    getTask(domain).then((data) => {
      setQuestions(data.questions);
      setArtifactConfig(data.artifactConfig);
      setExistingArtifactUrl(data.submission?.artifactUrl || null);
      setAnswers(
        Object.fromEntries(data.questions.map((q) => [q.id, q.answerText]))
      );
    });
  }, [domain]);

  const handleAnswerChange = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      await saveTaskAnswers(
        domain,
        Object.entries(answers).map(([questionId, text]) => ({ questionId, text }))
      );

      if (LINK_ARTIFACT_TYPES.includes(artifactConfig.type)) {
        if (artifactUrlInput) {
          await submitTaskArtifactLink(domain, artifactUrlInput);
        } else if (!existingArtifactUrl) {
          setError(`Please provide: ${artifactConfig.label}`);
          setSubmitting(false);
          return;
        }
      } else if (FILE_ARTIFACT_TYPES.includes(artifactConfig.type)) {
        if (artifactFile) {
          await submitTaskArtifactFile(domain, artifactFile);
        } else if (!existingArtifactUrl) {
          setError(`Please provide: ${artifactConfig.label}`);
          setSubmitting(false);
          return;
        }
      }

      await submitTask(domain);

      // Advance to the next selected-but-not-yet-submitted domain, or Interview if done.
      const [allDomains, selection, progress] = await Promise.all([
        getDomains(),
        getSelectedDomains(),
        getTaskProgress(),
      ]);
      const selectedNames = allDomains
        .filter((d) => selection.domainIds.includes(d.id))
        .map((d) => d.name);
      const submittedNames = allDomains
        .filter((d) => progress.submittedDomainIds.includes(d.id))
        .map((d) => d.name);
      const remaining = selectedNames.filter((name) => !submittedNames.includes(name));

      navigate(remaining.length > 0 ? `/tasks/${remaining[0]}` : "/interview");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (!questions) return <p>Loading...</p>;

  return (
    <div className="questions-page">
      <h1>{domain} Domain Questions</h1>

      <div className="questions-container">
        {questions.map((q, i) => (
          <div key={q.id} className="question">
            <p><b>{i + 1}.</b> {q.questionText}</p>
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              rows={3}
              style={{ width: "100%" }}
            />
          </div>
        ))}
      </div>

      {artifactConfig.type !== "none" && (
        <div className="upload-box">
          <div className="instruction-box">📌 Also provide: {artifactConfig.label}</div>

          {LINK_ARTIFACT_TYPES.includes(artifactConfig.type) && (
            <input
              type="url"
              placeholder={artifactConfig.label}
              value={artifactUrlInput}
              onChange={(e) => setArtifactUrlInput(e.target.value)}
            />
          )}

          {FILE_ARTIFACT_TYPES.includes(artifactConfig.type) && (
            <>
              <input
                type="file"
                onChange={(e) => setArtifactFile(e.target.files[0])}
              />
              {existingArtifactUrl && !artifactFile && (
                <p>
                  Current file:{" "}
                  <a href={`${process.env.REACT_APP_API_BASE_URL}${existingArtifactUrl}`} target="_blank" rel="noreferrer">
                    view
                  </a>
                </p>
              )}
            </>
          )}

          {existingArtifactUrl && LINK_ARTIFACT_TYPES.includes(artifactConfig.type) && !artifactUrlInput && (
            <p>Currently saved: {existingArtifactUrl}</p>
          )}
        </div>
      )}

      {taskClosed && (
        <p style={{ color: "red" }}>The task deadline has passed — submissions are locked.</p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleSubmit} disabled={submitting || taskClosed}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export default TaskQuestions;
