import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">
        IEEE Women in Engineering
      </h1>

      <p className="home-subtitle">
        Join a global network of innovators, leaders, and changemakers.
      </p>

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