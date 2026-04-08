import { useNavigate } from "react-router-dom"; // Hook for routing/navigation

function Home() { // Functional Component (Home page)
  const navigate = useNavigate(); // Hook: used to navigate between routes

  // JSX: UI structure
  return (
    <div className="home-container"> {/* Styling using CSS class */}

      {/* Static JSX content */}
      <h1 className="home-title">
        IEEE Women in Engineering
      </h1>

      <p className="home-subtitle">
        Join a global network of innovators, leaders, and changemakers.
      </p>

      {/* Button with event handling */}
      <button 
        className="apply-btn" // Styling
        onClick={() => navigate("/profile")} // Event + Routing (programmatic navigation)
      >
        Apply Now
      </button>

    </div>
  );
}

export default Home; // Export component for use in routing