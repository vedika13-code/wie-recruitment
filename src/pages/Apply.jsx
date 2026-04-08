import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Apply() {//A functional component representing your Apply page,Shows recruitment info,Displays domains + instructions,Has a button to start application
  const navigate = useNavigate();//hooks Allows navigation using code

  
  const [clickCount, setClickCount] = useState(0);

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

      {}
      <button 
        className="apply-btn"
        onClick={() => {
          setClickCount(clickCount + 1); 
          navigate("/profile");//When user clicks button → goes to Profile page
        }}
      >
        Start Application
      </button>

      {}
      <p style={{ fontSize: "12px", marginTop: "10px" }}>
        Button clicked: {clickCount} times
      </p>

    </div>
  );
}

export default Apply;
//Page loads:
//Shows recruitment info
/////clickCount = 0
//User clicks button:
//clickCount → increases
//UI updates instantly
//Then:
//Navigates to /profile