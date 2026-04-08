import { useNavigate } from "react-router-dom";//routing(clicking card navigates to diff route)
import PropTypes from "prop-types";

function Card({ title, status, path }) {//component
  const navigate = useNavigate();//hook(use navigate)

  const handleClick = () => {//event handling(function that runs when card is clicked)
    if (status === "locked") return;
    navigate(path);
  };

  return (
    <div className={`card ${status}`} onClick={handleClick}>
      <span className="badge">{/*styling*/}
        {status === "available" ? "AVAILABLE" : "LOCKED"} {/*conditional rendering*/}
      </span>

      <h2>{title}</h2>
    </div>
  );
}

// Props validation(checks if corect data type is passed), title ,status,path must be all strings
Card.propTypes = {
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
};

export default Card;
//full flow:
//parent sends prop->omponent receives->ui renders->user clicks->if avail then navs to web otherwise stays locked