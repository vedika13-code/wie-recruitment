import { useNavigate } from "react-router-dom";

function Interview() {
  const navigate = useNavigate();

  return (
    <div className="interview-page" style={{ padding: "40px", textAlign: "center" }}>

      <h1>Interview</h1>

      {/* 🔒 LOCK MESSAGE */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "10px"
        }}
      >
        <h2>🔒 Locked</h2>
        <p>You can access this section once a chapter representative reviews your tasks.</p>
      </div>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "#333",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        Back to Dashboard
      </button>

    </div>
  );
}

export default Interview;