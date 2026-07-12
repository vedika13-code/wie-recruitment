import { useState, useEffect } from "react";
import Card from "../components/Card";
import Countdown from "../components/Countdown";
import { getDashboard } from "../api";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  // "Has a profile" means "has actually filled in the required name field" — GET
  // /api/profile (and thus /api/dashboard) always returns a user record once signed
  // in, unlike the old localStorage check which was naturally null until first save.
  const hasProfile = Boolean(data.profile.name);

  // Interview unlocks once an admin has shortlisted (or later, selected) the
  // application — matches server/src/routes/interview.js's UNLOCKED_STATUSES.
  const interviewUnlocked = ["shortlisted", "selected"].includes(data.applicationStatus);

  const cards = [
    { title: "Profile", status: "available", path: "/profile" },
    { title: "Domain Selection", status: hasProfile ? "available" : "locked", path: "/domain" },
    { title: "Tasks", status: data.selectedDomains.length ? "available" : "locked", path: "/tasks" },
    { title: "Interview", status: interviewUnlocked ? "available" : "locked", path: "/interview" }
  ];

  return (
    <div>
      <h1 className="main-title">DASHBOARD</h1>

      <Countdown deadline={data.cycle.applicationDeadline} label="Applications close in" />

      {hasProfile && (
        <div className="profile-summary">
          <h2>Welcome, {data.profile.name}</h2>
        </div>
      )}

      {data.selectedDomains.length > 0 && (
        <div className="selected-domains">
          <h3>Your Selected Domain</h3>
          <div className="domain-tags">
            {data.selectedDomains.map((name) => (
              <span key={name}>
                {name}
                {data.submittedDomains.includes(name) ? " (submitted)" : ""}
              </span>
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
