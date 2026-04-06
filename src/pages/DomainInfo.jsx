function DomainInfo() {

  const domainData = [
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

Creativity, consistency, and trend awareness are essential in this domain. The goal is to build a strong, impactful, and engaging online identity for IEEE WIE.`,
      head: "Prachi Pandurang Raddi",
      phone: "6362900805",
    },
    {
      name: "Editorial",
      desc: `The Editorial Domain serves as the primary voice and storyteller for IEEE WIE operations.

We create and document all club content, from writing blogs, newsletters, and reports to capturing and sharing the club’s activities and achievements.

The team ensures all event details and initiative updates are delivered through clear, innovative, and professional communication.

If you enjoy writing, curating content, and turning ideas into impactful stories, this domain is where your words make a difference.`,
      head: "Anshika Agarwal",
      phone: "7483622187",
    },
    {
      name: "Design",
      desc: `The Design Domain is responsible for maintaining and developing the visual identity of IEEE WIE.

We create event posters, social media creatives, and merchandise designs that represent the chapter in a clear and consistent way.

Our goal is to ensure that every design reflects professionalism, creativity, and strong identity. We focus on layout, typography, color balance, and overall visual communication to ensure content is both appealing and meaningful.

If you enjoy designing, paying attention to detail, and turning ideas into clean and impactful visuals, this domain is the right place for you.`,
      head: "Srilekha Sridhar",
      phone: "7418027891",
    },
    {
      name: "Management",
      desc: `The Management Domain is the backbone of IEEE WIE.

We plan, coordinate, and ensure that every event and initiative runs smoothly from start to finish. From handling sponsorships and timelines to solving last-minute challenges, we turn ideas into action.

If you enjoy organizing, leading, and making things happen, this domain is where you grow by doing.`,
      head: "Shreya Sajan",
      phone: "8606405512",
    }
  ];

  return (
    <div className="domain-info-page">

      <h1 className="domain-info-title">Our Domains</h1>

      <div className="domain-info-grid">
        {domainData.map((d, i) => (
          <div key={i} className="domain-info-card">

            <h2>{d.name}</h2>

            {/* Multi-paragraph support */}
            {d.desc.split("\n\n").map((para, index) => (
              <p key={index} className="desc">{para}</p>
            ))}

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

export default DomainInfo;