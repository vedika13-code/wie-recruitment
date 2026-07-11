import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getActiveCycle } from "../api";
import Countdown from "../components/Countdown";

function Home() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);

  useEffect(() => {
    getActiveCycle().then(setCycle);
  }, []);

  return (
    <div className="home-container">
      <h1 className="home-title">
        IEEE Women in Engineering
      </h1>

      <p className="home-subtitle">
        Join a global network of innovators, leaders, and changemakers.
      </p>

      {cycle && <Countdown deadline={cycle.applicationDeadline} label="Applications close in" />}

      <button
        className="apply-btn"
        onClick={() => navigate("/profile")}
      >
        Apply Now
      </button>

    </div>
  );
}

export default Home;
