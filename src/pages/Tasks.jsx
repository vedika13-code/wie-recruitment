import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDomains, getSelectedDomains } from "../api";

function Tasks() {
  const navigate = useNavigate();
  const [domainNames, setDomainNames] = useState(null);

  useEffect(() => {
    Promise.all([getDomains(), getSelectedDomains()]).then(([allDomains, selection]) => {
      const names = allDomains
        .filter((d) => selection.domainIds.includes(d.id))
        .map((d) => d.name);
      setDomainNames(names);
    });
  }, []);

  return (
    <div className="tasks-page">
      <h1 className="tasks-title">Your Tasks</h1>

      <div className="tasks-container">
        {domainNames && domainNames.length > 0 ? (
          domainNames.map((name) => (
            <div
              key={name}
              className="task-card clickable"
              onClick={() => navigate(`/tasks/${name}`)}
            >
              <h3>{name}</h3>
              <p>Click to attempt questions</p>
            </div>
          ))
        ) : (
          <p>No domains selected.</p>
        )}
      </div>
    </div>
  );
}

export default Tasks;
