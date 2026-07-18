"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function DevLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("applicant");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/recruitment/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dev login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card mt-6 rounded-lg p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-300">
        Dev login (local only)
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="email"
          placeholder="any@vitstudent.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="glass-card w-full rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 sm:flex-1"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="glass-card rounded-md px-3 py-2 text-sm text-white"
        >
          <option value="applicant">applicant</option>
          <option value="admin">admin</option>
          <option value="super_admin">super_admin</option>
        </select>
        <Button type="submit" variant="secondary">
          Dev Login
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </form>
  );
}
