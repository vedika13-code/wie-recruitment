import { useNavigate } from "react-router-dom"; // Hook for routing/navigation

function Interview() { // Functional Component (Interview page)
  const navigate = useNavigate(); // Hook: used to navigate between routes

  // JSX: UI structure
  return (
    <div 
      className="interview-page" // Styling using CSS class
      style={{ padding: "40px", textAlign: "center" }} // Inline styling
    >

      {/* Static content */}
      <h1>Interview</h1>

      {/* JSX section (lock message UI) */}
      <div
        style={{ // Inline styling
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "10px"
        }}
      >
        <h2>🔒 Locked</h2>
        <p>
          You can access this section once a chapter representative reviews your tasks.
        </p>
      </div>

      {/* Button with event handling */}
      <button
        onClick={() => navigate("/dashboard")} // Event + Routing (programmatic navigation)
        style={{ // Inline styling
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

export default Interview; // Export component