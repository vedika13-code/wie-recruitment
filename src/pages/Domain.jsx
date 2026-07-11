import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getDomains, getSelectedDomains, setSelectedDomains } from "../api";

// Local images, keyed by domain name (still static assets, not server-provided)
import tech from "../assets/technical.png";
import proj from "../assets/projects.png";
import mgmt from "../assets/management.png";
import edit from "../assets/editorial.png";
import design from "../assets/design.png";
import pub from "../assets/publicity.png";

const IMAGES = {
  Technical: tech,
  Projects: proj,
  Management: mgmt,
  Editorial: edit,
  Design: design,
  Publicity: pub,
};

const MAX_DOMAINS = 2;

function Domain({ title }) {
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getDomains(), getSelectedDomains()]).then(([domainList, selection]) => {
      setDomains(domainList);
      setSelected(selection.domainIds);
    });
  }, []);

  const toggle = (id) => {
    setMessage("");
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((d) => d !== id);
      if (prev.length >= MAX_DOMAINS) {
        setMessage(`You can select at most ${MAX_DOMAINS} domains.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setMessage("Please select at least one domain.");
      return;
    }
    await setSelectedDomains(selected);
    navigate("/dashboard");
  };

  return (
    <div className="domain-page">
      <h1 className="domain-title">{title}</h1>

      <div className="domain-grid">
        {domains.map((d) => (
          <div
            key={d.id}
            className={`domain-card ${selected.includes(d.id) ? "selected" : ""}`}
            onClick={() => toggle(d.id)}
          >
            <img src={IMAGES[d.name]} alt={d.name} className="domain-img" />
            <h3>{d.name}</h3>
          </div>
        ))}
      </div>

      {message && <p style={{ color: "red" }}>{message}</p>}

      <button className="confirm-btn" onClick={handleSubmit}>
        Confirm Selection
      </button>
    </div>
  );
}

Domain.propTypes = {
  title: PropTypes.string,
};

Domain.defaultProps = {
  title: "Select up to 2 Domains",
};

export default Domain;
