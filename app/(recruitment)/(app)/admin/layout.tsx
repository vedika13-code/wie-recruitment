import { redirect } from "next/navigation";
import { getSession } from "@/lib/recruitment/auth";

const ADMIN_ROLES = ["admin", "super_admin"];

// Authoritative admin guard for the whole /admin subtree — mirrors the Express app's
// router-level `requireRole("admin","super_admin")`. A non-admin hitting any /admin
// page or the Server Actions under lib/recruitment/actions/admin.ts (which also call
// requireAdmin() themselves) must be rejected server-side, not just have the nav
// link hidden.
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  if (!user || !ADMIN_ROLES.includes(user.role)) redirect("/dashboard");

  return <>{children}</>;
}
