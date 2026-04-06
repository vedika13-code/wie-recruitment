import { useNavigate } from "react-router-dom";

function Card({ title, status }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (status === "locked") return;

    if (title === "Profile") navigate("/profile");
    if (title === "Domain Selection") navigate("/domain");
    if (title === "Tasks") navigate("/tasks");
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

export default Card;