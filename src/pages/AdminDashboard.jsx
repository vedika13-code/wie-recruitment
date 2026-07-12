import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  getAdminApplications,
  getAdminApplication,
  setApplicationStatus,
  reviewSubmission,
  getAdminInterviewSlots,
  createInterviewSlot,
} from "../api";
import { formatSlotDate, formatSlotTime } from "../utils";

const STATUS_OPTIONS = ["draft", "submitted", "shortlisted", "rejected", "selected"];
const DOMAIN_NAMES = ["Technical", "Projects", "Management", "Editorial", "Design", "Publicity"];

function artifactHref(artifactUrl) {
  if (!artifactUrl) return null;
  return artifactUrl.startsWith("http")
    ? artifactUrl
    : `${process.env.REACT_APP_API_BASE_URL}${artifactUrl}`;
}

function DomainReview({ domain, onSave }) {
  const [score, setScore] = useState(domain.score ?? "");
  const [notes, setNotes] = useState(domain.reviewerNotes || "");

  return (
    <div className="domain-review">
      <h3>{domain.domainName} — {domain.submissionStatus}</h3>

      {domain.answers?.map((a, i) => (
        <div key={i}>
          <p><b>{a.question}</b></p>
          <p>{a.answer || "(no answer)"}</p>
        </div>
      ))}

      {domain.artifactUrl && (
        <p>
          Artifact:{" "}
          <a href={artifactHref(domain.artifactUrl)} target="_blank" rel="noreferrer">
            {domain.artifactUrl}
          </a>
        </p>
      )}

      <label>Score: </label>
      <input type="number" value={score} onChange={(e) => setScore(e.target.value)} />

      <div>
        <label>Notes: </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          style={{ width: "100%" }}
        />
      </div>

      <button
        type="button"
        disabled={!domain.submissionId}
        onClick={() => onSave(domain.submissionId, score === "" ? null : Number(score), notes)}
      >
        Save Review
      </button>
    </div>
  );
}

DomainReview.propTypes = {
  domain: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

function InterviewSlotManager() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ slotDate: "", startTime: "", endTime: "", meetLink: "", capacity: 1 });
  const [error, setError] = useState("");

  const load = () => getAdminInterviewSlots().then(setSlots);

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createInterviewSlot(form);
      setForm({ slotDate: "", startTime: "", endTime: "", meetLink: "", capacity: 1 });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="interview-slot-manager" style={{ marginTop: "30px" }}>
      <h2>Interview Slots</h2>

      <form onSubmit={handleCreate} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <input type="date" name="slotDate" value={form.slotDate} onChange={handleChange} required />
        <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
        <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
        <input
          type="url"
          name="meetLink"
          placeholder="Meet link"
          value={form.meetLink}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="capacity"
          min="1"
          value={form.capacity}
          onChange={handleChange}
          style={{ width: "60px" }}
          required
        />
        <button type="submit">Create Slot</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table style={{ marginTop: "12px" }}>
        <thead>
          <tr>
            <th>Date</th><th>Time</th><th>Meet Link</th><th>Booked / Capacity</th><th>Booked by</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.id}>
              <td>{formatSlotDate(s.slotDate)}</td>
              <td>{formatSlotTime(s.startTime)}–{formatSlotTime(s.endTime)}</td>
              <td><a href={s.meetLink} target="_blank" rel="noreferrer">{s.meetLink}</a></td>
              <td>{s.bookedCount} / {s.capacity}</td>
              <td>
                {s.bookings.length === 0
                  ? "—"
                  : s.bookings.map((b) => b.name || b.email).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [domainFilter, setDomainFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [message, setMessage] = useState("");

  const loadList = useCallback(() => {
    getAdminApplications({ domain: domainFilter, status: statusFilter }).then(setApplications);
  }, [domainFilter, statusFilter]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openApplication = (id) => {
    setSelectedId(id);
    getAdminApplication(id).then(setDetail);
  };

  const handleStatusChange = async (status) => {
    await setApplicationStatus(selectedId, status);
    setMessage("Status updated.");
    openApplication(selectedId);
    loadList();
  };

  const handleReview = async (submissionId, score, notes) => {
    await reviewSubmission(submissionId, { score, notes, status: "reviewed" });
    setMessage("Review saved.");
    openApplication(selectedId);
    loadList();
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin — Applications</h1>

      <div className="admin-filters">
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
          <option value="">All domains</option>
          {DOMAIN_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {message && <p>{message}</p>}

      <div className="admin-layout" style={{ display: "flex", gap: "20px" }}>
        <div className="admin-list" style={{ flex: 1 }}>
          {applications.map((app) => (
            <div
              key={app.applicationId}
              className={`admin-row ${selectedId === app.applicationId ? "selected" : ""}`}
              onClick={() => openApplication(app.applicationId)}
              style={{ cursor: "pointer", border: "1px solid #ccc", padding: "8px", marginBottom: "8px" }}
            >
              <strong>{app.user.name || app.user.email}</strong> — {app.status}
              <div>
                {app.domains.map((d) => (
                  <span key={d.domainId} className="tag" style={{ marginRight: "6px" }}>
                    {d.domainName} ({d.submissionStatus})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {detail && (
          <div className="admin-detail" style={{ flex: 1 }}>
            <h2>{detail.user.name || detail.user.email}</h2>
            <p>{detail.user.email} · {detail.user.phone} · {detail.user.branch}</p>

            <div>
              <label>Application status: </label>
              <select value={detail.status} onChange={(e) => handleStatusChange(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {detail.domains.map((d) => (
              // Keyed on applicationId+domainId, not just domainId — otherwise switching
              // between two applicants who both selected the same domain would reuse
              // this component instance and leak the previous applicant's score/notes
              // draft into the new one (same stale-state class of bug as TaskQuestions.jsx).
              <DomainReview key={`${detail.applicationId}-${d.domainId}`} domain={d} onSave={handleReview} />
            ))}
          </div>
        )}
      </div>

      <InterviewSlotManager />
    </div>
  );
}

export default AdminDashboard;
