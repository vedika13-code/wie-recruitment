require("dotenv/config");
const prisma = require("../src/db");

// Domain content migrated out of src/pages/DomainInfo.jsx's hardcoded array —
// see docs/ARCHITECTURE.md §5 (frontend changes) for why this moved server-side.
const DOMAINS = [
  {
    name: "Technical",
    description: `The Technical Domain of IEEE WIE is a collaborative space where innovation thrives through inclusivity, mentorship, and community-driven engineering.

Rooted in IEEE's mission of advancing technology for humanity, we aim to create an empowering environment where members, especially women and underrepresented groups in tech, can build confidence, develop technical expertise, and contribute to impactful solutions.

This domain focuses on designing, developing, and deploying meaningful technological projects that address real-world challenges while fostering peer learning, leadership, and cross-domain collaboration.

If you believe in using technology to build not just systems, but a supportive and inclusive technical community, this is your place.`,
    headName: "Vedika Goyal",
    phone: "9740179001",
  },
  {
    name: "Projects",
    description: `The Projects Domain is where ideas turn into reality. We ideate, design, and build meaningful, high-impact projects that represent the club and showcase what we can achieve together.

From brainstorming innovative concepts to executing and presenting finished products, this domain is completely project-centric.

If you love solving problems, collaborating across domains, and bringing creative ideas to life, this is your place.`,
    headName: "Kashika Tolani",
    phone: "9569032271",
  },
  {
    name: "Publicity",
    description: `The Publicity Domain handles the digital presence and branding of IEEE WIE across social media platforms.

The team works on content creation, reel editing, and strategic promotion of events and initiatives. Members analyse engagement, improve reach, and optimise content for better interaction.

Creativity, consistency, and trend awareness are essential in this domain.`,
    headName: "Prachi Pandurang Raddi",
    phone: "6362900805",
  },
  {
    name: "Editorial",
    description: `The Editorial Domain serves as the primary voice and storyteller for IEEE WIE operations.

We create blogs, newsletters, and reports while documenting all club activities.`,
    headName: "Anshika Agarwal",
    phone: "7483622187",
  },
  {
    name: "Design",
    description: `The Design Domain focuses on visual identity.

We create posters, creatives, and branding materials that reflect professionalism and creativity.`,
    headName: "Srilekha Sridhar",
    phone: "7418027891",
  },
  {
    name: "Management",
    description: `The Management Domain ensures smooth execution of all events.

We coordinate, organize, and handle logistics from start to finish.`,
    headName: "Shreya Sajan",
    phone: "8606405512",
  },
];

async function main() {
  const cycle = await prisma.cycle.upsert({
    where: { name: "2026" },
    update: {},
    create: { name: "2026", status: "open" },
  });

  for (const d of DOMAINS) {
    const domain = await prisma.domain.upsert({
      where: { name: d.name },
      update: { description: d.description },
      create: { name: d.name, description: d.description },
    });

    await prisma.domainAssignment.upsert({
      where: { cycleId_domainId: { cycleId: cycle.id, domainId: domain.id } },
      update: { headName: d.headName, phone: d.phone },
      create: {
        cycleId: cycle.id,
        domainId: domain.id,
        headName: d.headName,
        phone: d.phone,
      },
    });
  }

  console.log(`Seeded cycle "${cycle.name}" with ${DOMAINS.length} domains.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
