import { useState, useEffect } from "react";
import Card from "../components/Card";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("profile"));
    const storedDomains = JSON.parse(localStorage.getItem("domains")) || [];

    setProfile(storedProfile);
    setDomains(storedDomains);
  }, []);

  const cards = [
    { title: "Profile", status: "available", path: "/profile" },
    { title: "Domain Selection", status: profile ? "available" : "locked", path: "/domain" },
    { title: "Tasks", status: domains.length ? "available" : "locked", path: "/tasks" },
    { title: "Interview", status: "locked", path: "/interview" }
  ];

  return (
    <div>
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