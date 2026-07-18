"use client";

import { useRouter } from "next/navigation";

type Props = {
  domainNames: string[];
  statusOptions: string[];
  domain: string;
  status: string;
};

export default function AdminFilters({ domainNames, statusOptions, domain, status }: Props) {
  const router = useRouter();

  const updateParam = (key: "domain" | "status", value: string) => {
    const params = new URLSearchParams({ domain, status });
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.push(query ? `/admin?${query}` : "/admin");
  };

  return (
    <div className="mt-6 flex gap-4">
      <select
        value={domain}
        onChange={(e) => updateParam("domain", e.target.value)}
        className="glass-card rounded-md px-3 py-2 text-sm text-white"
      >
        <option value="">All domains</option>
        {domainNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => updateParam("status", e.target.value)}
        className="glass-card rounded-md px-3 py-2 text-sm text-white"
      >
        <option value="">All statuses</option>
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
