import { useNavigate } from "react-router-dom";

function Tasks() {
  const navigate = useNavigate();
  const domains = JSON.parse(localStorage.getItem("domains"));

  // 🔥 NEW: Clear Profile + Domains
  const handleClearAll = () => {
    const confirmClear = window.confirm(
      "This will delete your profile and selected domains. Continue?"
    );

    if (confirmClear) {
      localStorage.removeItem("profile");
      localStorage.removeItem("domains");
      localStorage.removeItem("user");

      alert("Data cleared");

      navigate("/login");
      window.location.reload();
    }
  };

  return (
    <div className="tasks-page">

      <h1 className="tasks-title">Your Tasks</h1>

      <div className="tasks-container">
        {domains && domains.length > 0 ? (
          domains.map((d, i) => (
            <div 
              key={i} 
              className="task-card clickable"
              onClick={() => navigate(`/tasks/${d}`)}
            >
              <h3>{d}</h3>
              <p>Click to attempt questions</p>
            </div>
          ))
        ) : (
          <p>No domains selected.</p>
        )}
      </div>

      {/* 🔥 NEW BUTTON */}
      <button
        type="button"
        onClick={handleClearAll}
        style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        Clear Profile & Domains
      </button>

    </div>
  );
}

export default Tasks;