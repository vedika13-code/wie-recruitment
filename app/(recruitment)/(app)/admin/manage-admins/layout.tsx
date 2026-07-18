import { redirect } from "next/navigation";
import { getSession } from "@/lib/recruitment/auth";

// Additional guard on top of admin/layout.tsx's admin-or-super_admin check — this
// page (and the actions it calls) requires super_admin specifically. A regular admin
// must be rejected here too, not just have the nav link hidden.
export default async function ManageAdminsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  if (!user || user.role !== "super_admin") redirect("/admin");

  return <>{children}</>;
}
