import { useState, useEffect } from "react";
import Card from "../components/Card";

function Dashboard() {//A functional component repre your Dashboard page,Controls which cards are locked/unlocked
//This is the main control center,Shows user info,Shows selected domains

  const [profile, setProfile] = useState(null);
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("profile"));//Profile saved earlier → loaded here 
    //Domains saved earlier → loaded here
    const storedDomains = JSON.parse(localStorage.getItem("domains")) || [];

    setProfile(storedProfile);
    setDomains(storedDomains);
  }, []);

  const cards = [//You are controlling app flow using logic
    { title: "Profile", status: "available", path: "/profile" },
    { title: "Domain Selection", status: profile ? "available" : "locked", path: "/domain" },
    { title: "Tasks", status: domains.length ? "available" : "locked", path: "/tasks" },
    { title: "Interview", status: "locked", path: "/interview" }
  ];

  return (
    <div>{/*JSX (UI Rendering)*/}
      <h1 className="main-title">DASHBOARD</h1>

      {/* Welcome */}
      {profile && (
        <div className="profile-summary">
          <h2>Welcome, {profile.name}</h2>
        </div>
      )}

      {/* Domains */}
      {domains.length > 0 && (
        <div className="selected-domains">
          <h3>Your Selected Domain</h3>
          <div className="domain-tags">
            {domains.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid">
        {cards.map((c, i) => (
          <Card key={i} {...c} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

//Dashboard loads
// useEffect runs
// Data fetched from localStorage
//State updated:
//profile
// domains
// UI updates:
// Welcome message appears (if profile exists)
// Domains shown (if selected)
// Cards logic runs:
// Locks/unlocks based on state
// Cards rendered: