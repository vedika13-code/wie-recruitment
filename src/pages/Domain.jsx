import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// images
import tech from "../assets/technical.png";
import proj from "../assets/projects.png";
import mgmt from "../assets/management.png";
import edit from "../assets/editorial.png";
import design from "../assets/design.png";
import pub from "../assets/publicity.png";

function Domain({ title }) {
  const navigate = useNavigate();

  //  State
  const [domains, setDomains] = useState([]);
  const [selected, setSelected] = useState("");

  //  useEffect (load data)
  useEffect(() => {
    const data = [
      { name: "Technical", img: tech },
      { name: "Projects", img: proj },
      { name: "Management", img: mgmt },
      { name: "Editorial", img: edit },
      { name: "Design", img: design },
      { name: "Publicity", img: pub }
    ];

    setDomains(data);
  }, []);

  //  toggle logic
  const toggle = (d) => {
    setSelected(prev => (prev === d ? "" : d));
  };

  //  submit
  const handleSubmit = () => {
    if (!selected) {
      alert("Please select a domain");
      return;
    }

    localStorage.setItem("domains", JSON.stringify([selected]));
    navigate("/dashboard");
  };

  //  clear everything
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

      {/*  Props usage */}
      <h1 className="domain-title">{title}</h1>

      {/* Dynamic rendering */}
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

      {/*  Button */}
      <button className="confirm-btn" onClick={handleSubmit}>
        Confirm Selection
      </button>

      {/*  Clear Button */}
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


Domain.propTypes = {
  title: PropTypes.string,
};


Domain.defaultProps = {
  title: "Select a Domain",
};

export default Domain;