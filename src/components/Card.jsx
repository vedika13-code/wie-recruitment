import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function Card({ title, status, path }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (status === "locked") return;
    navigate(path);
  };

  return (
    <div className={`card ${status}`} onClick={handleClick}>
      <span className="badge">
        {status === "available" ? "AVAILABLE" : "LOCKED"}
      </span>

      <h2>{title}</h2>
    </div>
  );
}

// ✅ Props validation
Card.propTypes = {
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
};

export default Card;