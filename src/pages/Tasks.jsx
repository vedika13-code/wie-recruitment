import { useNavigate } from "react-router-dom"; // Hook: routing/navigation

function Tasks() { // Functional Component (Tasks page)

  const navigate = useNavigate(); // Hook: used for navigation

  // LocalStorage: retrieving selected domains
  const domains = JSON.parse(localStorage.getItem("domains"));

  // Event handling: clear all stored data
  const handleClearAll = () => {
    const confirmClear = window.confirm(
      "This will delete your profile and selected domains. Continue?"
    );

    if (confirmClear) {
      // LocalStorage: remove stored data
      localStorage.removeItem("profile");
      localStorage.removeItem("domains");
      localStorage.removeItem("user");

      alert("Data cleared"); // Browser API

      navigate("/login"); // Routing
      window.location.reload(); // Force reload
    }
  };

  // JSX: UI structure
  return (
    <div className="tasks-page"> {/* Styling */}

      {/* Static content */}
      <h1 className="tasks-title">Your Tasks</h1>

      {/* Conditional rendering */}
      <div className="tasks-container">
        {domains && domains.length > 0 ? ( // Check if domains exist

          // Dynamic rendering (array mapping)
          domains.map((d, i) => (
            <div 
              key={i} // Key for list rendering
              className="task-card clickable" // Styling
              onClick={() => navigate(`/tasks/${d}`)} // Event + Routing (dynamic route)
            >
              <h3>{d}</h3>
              <p>Click to attempt questions</p>
            </div>
          ))

        ) : (
          // Fallback UI if no domains
          <p>No domains selected.</p>
        )}
      </div>

      {/* Button with inline styling + event handling */}
      <button
        type="button"
        onClick={handleClearAll}
        style={{ // Inline styling
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

export default Tasks; // Export component