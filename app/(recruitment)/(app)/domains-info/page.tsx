import { getDomainsWithHeads } from "@/lib/recruitment/domains";
import SectionTitle from "@/components/ui/SectionTitle";
import GlassCard from "@/components/ui/GlassCard";

export default async function DomainsInfoPage() {
  const domains = await getDomainsWithHeads();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <SectionTitle eyebrow="IEEE WIE" title="Our Domains" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {domains.map((d) => (
          <GlassCard key={d.id}>
            <h2 className="text-xl font-bold text-white">{d.name}</h2>
            {(d.description ?? "").split("\n\n").map((para, index) => (
              <p key={index} className="mt-3 text-sm text-white/80">
                {para}
              </p>
            ))}
            {d.head && (
              <div className="mt-4 border-t border-white/10 pt-4 text-sm text-white/70">
                <p>
                  <span className="font-semibold text-white">Domain Head:</span> {d.head.name}
                </p>
                {d.head.phone && (
                  <p>
                    <span className="font-semibold text-white">Phone:</span> {d.head.phone}
                  </p>
                )}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </main>
  );
}
