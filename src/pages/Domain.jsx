import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ correct imports
import tech from "../assets/technical.png";
import proj from "../assets/projects.png";
import mgmt from "../assets/management.png";
import edit from "../assets/editorial.png";
import design from "../assets/design.png";
import pub from "../assets/publicity.png";

function Domain() {
  const navigate = useNavigate();

  const domains = [
    { name: "Technical", img: tech },
    { name: "Projects", img: proj },
    { name: "Management", img: mgmt },
    { name: "Editorial", img: edit },
    { name: "Design", img: design },
    { name: "Publicity", img: pub }
  ];

  // ✅ single selection (not array)
  const [selected, setSelected] = useState("");

  // ✅ toggle logic (only one allowed)
  const toggle = (d) => {
    if (selected === d) {
      setSelected(""); // deselect
    } else {
      setSelected(d);
    }
  };

  const handleSubmit = () => {
    if (!selected) {
      alert("Please select a domain");
      return;
    }

    // store as array (so rest of app doesn't break)
    localStorage.setItem("domains", JSON.stringify([selected]));

    navigate("/dashboard");
  };

  // 🔥 Clear Profile + Domains
  const handleClearAll = () => {
    const confirmClear = window.confirm(
      "This will delete your profile and selected domain. Continue?"
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
    <div className="domain-page">

      {/* ✅ updated title */}
      <h1 className="domain-title">Select a Domain</h1>

      <div className="domain-grid">
        {domains.map((d, i) => (
          <div
            key={i}
            className={`domain-card ${selected === d.name ? "selected" : ""}`}
            onClick={() => toggle(d.name)}
          >
            <img src={d.img} alt={d.name} className="domain-img" />
            <h3>{d.name}</h3>
          </div>
        ))}
      </div>

      <button className="confirm-btn" onClick={handleSubmit}>
        Confirm Selection
      </button>

      {/* 🔥 CLEAR BUTTON */}
      <button
        type="button"
        onClick={handleClearAll}
        style={{
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

export default Domain;