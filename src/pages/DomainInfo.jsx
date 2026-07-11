import { useState, useEffect } from "react";
import { getDomains } from "../api";

function DomainInfo() {
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    getDomains().then(setDomains);
  }, []);

  return (
    <div className="domain-info-page">
      <h1 className="domain-info-title">Our Domains</h1>

      <div className="domain-info-grid">
        {domains.map((d) => (
          <div key={d.id} className="domain-info-card">
            <h2>{d.name}</h2>

            {d.description.split("\n\n").map((para, index) => (
              <p key={index} className="desc">{para}</p>
            ))}

            {d.head && (
              <div className="contact">
                <p><b>Domain Head:</b> {d.head.name}</p>
                <p><b>Phone:</b> {d.head.phone}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DomainInfo;
