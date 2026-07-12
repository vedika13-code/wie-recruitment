import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getInterviewStatus, bookInterviewSlot } from "../api";
import { formatSlotDate, formatSlotTime } from "../utils";

function Interview() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  const load = () => getInterviewStatus().then(setStatus);

  useEffect(() => {
    load();
  }, []);

  const handleBook = async (slotId) => {
    setError("");
    setBooking(true);
    try {
      await bookInterviewSlot(slotId);
      await load();
    } catch (err) {
      setError(err.message);
      await load(); // re-fetch — someone else may have just taken the last seat
    } finally {
      setBooking(false);
    }
  };

  if (!status) return <p>Loading...</p>;

  if (!status.unlocked) {
    return (
      <div className="interview-page" style={{ padding: "40px", textAlign: "center" }}>
        <h1>Interview</h1>
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "10px" }}>
          <h2>🔒 Locked</h2>
          <p>You can access this section once a chapter representative reviews your tasks.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ marginTop: "20px", padding: "10px 20px", border: "none", borderRadius: "5px", backgroundColor: "#333", color: "#fff", cursor: "pointer" }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (status.booking) {
    const { booking: b } = status;
    return (
      <div className="interview-page" style={{ padding: "40px", textAlign: "center" }}>
        <h1>Interview</h1>
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#eef7ee", borderRadius: "10px" }}>
          <h2>You're booked</h2>
          <p>{formatSlotDate(b.slotDate)} · {formatSlotTime(b.startTime)}–{formatSlotTime(b.endTime)}</p>
          <p>
            <a href={b.meetLink} target="_blank" rel="noreferrer">{b.meetLink}</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page" style={{ padding: "40px" }}>
      <h1>Interview — Pick a Slot</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {status.availableSlots.length === 0 && <p>No interview slots have been created yet.</p>}

      <div className="slot-list">
        {status.availableSlots.map((slot) => {
          const remaining = slot.capacity - slot.bookedCount;
          const full = remaining <= 0;
          return (
            <div
              key={slot.id}
              className="slot-card"
              style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "10px" }}
            >
              <p>
                <b>{formatSlotDate(slot.slotDate)}</b> · {formatSlotTime(slot.startTime)}–{formatSlotTime(slot.endTime)}
              </p>
              <p>{full ? "Unavailable" : `${remaining} of ${slot.capacity} spots left`}</p>
              <button disabled={full || booking} onClick={() => handleBook(slot.id)}>
                {full ? "Unavailable" : booking ? "Booking..." : "Book this slot"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Interview;
