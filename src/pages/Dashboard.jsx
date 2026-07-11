import { useState, useEffect } from "react";
import Card from "../components/Card";
import { getProfile, getDomains, getSelectedDomains } from "../api";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [domainNames, setDomainNames] = useState([]);

  useEffect(() => {
    Promise.all([getProfile(), getDomains(), getSelectedDomains()]).then(
      ([profileData, allDomains, selection]) => {
        setProfile(profileData);
        setDomainNames(
          allDomains
            .filter((d) => selection.domainIds.includes(d.id))
            .map((d) => d.name)
        );
      }
    );
  }, []);

  // "Has a profile" now means "has actually filled in the required name field" —
  // GET /api/profile always returns a user record once signed in, unlike the old
  // localStorage check which was naturally null until Profile.jsx first wrote to it.
  const hasProfile = Boolean(profile?.name);

  const cards = [
    { title: "Profile", status: "available", path: "/profile" },
    { title: "Domain Selection", status: hasProfile ? "available" : "locked", path: "/domain" },
    { title: "Tasks", status: domainNames.length ? "available" : "locked", path: "/tasks" },
    { title: "Interview", status: "locked", path: "/interview" }
  ];

  return (
    <div>
      <h1 className="main-title">DASHBOARD</h1>

      {hasProfile && (
        <div className="profile-summary">
          <h2>Welcome, {profile.name}</h2>
        </div>
      )}

      {domainNames.length > 0 && (
        <div className="selected-domains">
          <h3>Your Selected Domain</h3>
          <div className="domain-tags">
            {domainNames.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid">
        {cards.map((c, i) => (
          <Card key={i} {...c} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
