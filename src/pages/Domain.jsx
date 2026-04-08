import { useState, useEffect } from "react"; // Hooks: useState (state), useEffect (lifecycle)
import { useNavigate } from "react-router-dom"; // Hook for routing/navigation
import PropTypes from "prop-types"; // Props validation

// images (assets import)
import tech from "../assets/technical.png";
import proj from "../assets/projects.png";
import mgmt from "../assets/management.png";
import edit from "../assets/editorial.png";
import design from "../assets/design.png";
import pub from "../assets/publicity.png";

function Domain({ title }) { // Functional Component + Props
  const navigate = useNavigate(); // Hook: used for navigation

  // State: stores domain list and selected domain
  const [domains, setDomains] = useState([]);
  const [selected, setSelected] = useState("");

  // useEffect: runs once when component loads (like componentDidMount)
  useEffect(() => {
    const data = [
      { name: "Technical", img: tech },
      { name: "Projects", img: proj },
      { name: "Management", img: mgmt },
      { name: "Editorial", img: edit },
      { name: "Design", img: design },
      { name: "Publicity", img: pub }
    ];

    setDomains(data); // Updating state → triggers re-render
  }, []);

  // Event handling + state logic (toggle selection)
  const toggle = (d) => {
    setSelected(prev => (prev === d ? "" : d)); // Select/unselect domain
  };

  // Event handling (submit button)
  const handleSubmit = () => {
    // Validation
    if (!selected) {
      alert("Please select a domain"); // Browser API
      return;
    }

    // LocalStorage: saving selected domain
    localStorage.setItem("domains", JSON.stringify([selected]));

    // Routing: navigate to dashboard
    navigate("/dashboard");
  };

  // Event handling (clear all data)
  const handleClearAll = () => {
    // Confirmation dialog
    const confirmClear = window.confirm(
      "This will delete your profile and selected domain. Continue?"
    );

    if (confirmClear) {
      // LocalStorage: removing stored data
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
    <div className="domain-page"> {/* Styling using CSS class */}

      {/* Props usage */}
      <h1 className="domain-title">{title}</h1>

      {/* Dynamic rendering (array mapping) */}
      <div className="domain-grid">
        {domains.map((d, i) => ( // Loop through domains
          <div
            key={i} // Key for list rendering
            className={`domain-card ${selected === d.name ? "selected" : ""}`} // Dynamic styling
            onClick={() => toggle(d.name)} // Event handling
          >
            <img src={d.img} alt={d.name} className="domain-img" /> {/* Image rendering */}
            <h3>{d.name}</h3>
          </div>
        ))}
      </div>

      {/* Button with event handler */}
      <button className="confirm-btn" onClick={handleSubmit}>
        Confirm Selection
      </button>

      {/* Inline styling + event handling */}
      <button
        type="button"
        onClick={handleClearAll}
        style={{ // Inline styling in React
          marginTop: "15px",
          padding: "12px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          width: "100%"
        }}
      >
        Clear Profile & Domain
      </button>

    </div>
  );
}

// Props validation
Domain.propTypes = {
  title: PropTypes.string,
};

// Default props (used if no title is passed)
Domain.defaultProps = {
  title: "Select a Domain",
};

export default Domain; // Export component