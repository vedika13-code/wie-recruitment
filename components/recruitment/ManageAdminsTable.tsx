"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { addAdminAction, removeAdminAction } from "@/lib/recruitment/actions/admins";
import type { AdminListItem } from "@/lib/recruitment/actions/admins";

export default function ManageAdminsTable({
  admins,
  selfId,
}: {
  admins: AdminListItem[];
  selfId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const result = await addAdminAction(email, role);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage(`${email} is now ${role}.`);
    setEmail("");
    router.refresh();
  };

  const handleRemove = async (id: string) => {
    setError("");
    setMessage("");
    const result = await removeAdminAction(id);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage("Admin access removed.");
    router.refresh();
  };

  return (
    <div className="mt-8">
      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
        <input
          type="email"
          placeholder="email@vitstudent.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="glass-card rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="glass-card rounded-md px-3 py-2 text-sm text-white"
        >
          <option value="admin">admin</option>
          <option value="super_admin">super_admin</option>
        </select>
        <Button type="submit" variant="secondary">
          Add / Update
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {message && <p className="mt-3 text-sm text-purple-300">{message}</p>}

      <GlassCard className="mt-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-purple-300">
              <th className="pb-2">Email</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Added by</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-t border-white/10">
                <td className="py-2 text-white/90">{a.email}</td>
                <td className="py-2 text-white/90">{a.name || "—"}</td>
                <td className="py-2 text-white/90">{a.role}</td>
                <td className="py-2 text-white/70">{a.addedBy || "—"}</td>
                <td className="py-2">
                  <Button
                    onClick={() => handleRemove(a.id)}
                    disabled={a.id === selfId}
                    variant="glass"
                    title={a.id === selfId ? "You cannot remove your own access" : ""}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
