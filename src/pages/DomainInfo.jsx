import { useState, useEffect } from "react"; // Hooks: useState (state), useEffect (lifecycle)
import PropTypes from "prop-types"; // (Imported but not used here)

function DomainInfo() { // Functional Component (Domain Info page)

  // State: stores list of domain details
  const [domains, setDomains] = useState([]);

  // useEffect: runs once when component loads
  useEffect(() => {

    // Static data (domain details)
    const data = [
      {
        name: "Technical",
        desc: `The Technical Domain of IEEE WIE is a collaborative space where innovation thrives through inclusivity, mentorship, and community-driven engineering.

Rooted in IEEE’s mission of advancing technology for humanity, we aim to create an empowering environment where members, especially women and underrepresented groups in tech, can build confidence, develop technical expertise, and contribute to impactful solutions.

This domain focuses on designing, developing, and deploying meaningful technological projects that address real-world challenges while fostering peer learning, leadership, and cross-domain collaboration.

If you believe in using technology to build not just systems, but a supportive and inclusive technical community, this is your place.`,
        head: "Vedika Goyal",
        phone: "9740179001",
      },
      {
        name: "Projects",
        desc: `The Projects Domain is where ideas turn into reality. We ideate, design, and build meaningful, high-impact projects that represent the club and showcase what we can achieve together.

From brainstorming innovative concepts to executing and presenting finished products, this domain is completely project-centric.

If you love solving problems, collaborating across domains, and bringing creative ideas to life, this is your place.`,
        head: "Kashika Tolani",
        phone: "9569032271",
      },
      {
        name: "Publicity",
        desc: `The Publicity Domain handles the digital presence and branding of IEEE WIE across social media platforms.

The team works on content creation, reel editing, and strategic promotion of events and initiatives. Members analyse engagement, improve reach, and optimise content for better interaction.

Creativity, consistency, and trend awareness are essential in this domain.`,
        head: "Prachi Pandurang Raddi",
        phone: "6362900805",
      },
      {
        name: "Editorial",
        desc: `The Editorial Domain serves as the primary voice and storyteller for IEEE WIE operations.

We create blogs, newsletters, and reports while documenting all club activities.`,
        head: "Anshika Agarwal",
        phone: "7483622187",
      },
      {
        name: "Design",
        desc: `The Design Domain focuses on visual identity.

We create posters, creatives, and branding materials that reflect professionalism and creativity.`,
        head: "Srilekha Sridhar",
        phone: "7418027891",
      },
      {
        name: "Management",
        desc: `The Management Domain ensures smooth execution of all events.

We coordinate, organize, and handle logistics from start to finish.`,
        head: "Shreya Sajan",
        phone: "8606405512",
      }
    ];

    setDomains(data); // Updating state → triggers re-render
  }, []);

  // JSX: UI structure
  return (
    <div className="domain-info-page"> {/* Styling using CSS class */}

      <h1 className="domain-info-title">Our Domains</h1>

      {/* Dynamic rendering using map */}
      <div className="domain-info-grid">
        {domains.map((d, i) => ( // Loop through domains array
          <div key={i} className="domain-info-card"> {/* Key required for list */}

            {/* Display domain name */}
            <h2>{d.name}</h2>

            {/* Splitting description into paragraphs */}
            {d.desc.split("\n\n").map((para, index) => (
              <p key={index} className="desc">{para}</p> // Nested mapping
            ))}

            {/* Contact info */}
            <div className="contact">
              <p><b>Domain Head:</b> {d.head}</p>
              <p><b>Phone:</b> {d.phone}</p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default DomainInfo; // Export component