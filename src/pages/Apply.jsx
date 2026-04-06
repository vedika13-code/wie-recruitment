import { useNavigate } from "react-router-dom";

function Apply() {
  const navigate = useNavigate();

  return (
    <div className="apply-page">

      <h1 className="apply-title">IEEE WIE Recruitment 2026</h1>

      <p className="apply-intro">
        Join a community of innovators, leaders, and changemakers.
        IEEE Women in Engineering provides a platform to learn,
        collaborate, and grow.
      </p>

      {/* DOMAINS */}
      <div className="apply-section">
        <h2>Domains</h2>
        <ul>
          <li>Technical – Build and develop projects</li>
          <li>Projects – Work on innovative ideas</li>
          <li>Management – Organize and lead events</li>
          <li>Editorial – Content and writing</li>
          <li>Design – Visual and UI design</li>
          <li>Publicity – Social media and outreach</li>
        </ul>
      </div>

      {/* INSTRUCTIONS */}
      <div className="apply-section">
        <h2>Instructions</h2>
        <ul>
          <li>Fill your profile details carefully</li>
          <li>Select a maximum of 2 domains</li>
          <li>Complete assigned tasks</li>
          <li>Upload your submissions before deadline</li>
        </ul>
      </div>

      {/* CTA */}
      <button 
        className="apply-btn"
        onClick={() => navigate("/profile")}
      >
        Start Application
      </button>

    </div>
  );
}

export default Apply;