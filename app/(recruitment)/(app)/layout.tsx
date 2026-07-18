import { redirect } from "next/navigation";
import { getSession } from "@/lib/recruitment/auth";
import RecruitmentNavbar from "@/components/recruitment/RecruitmentNavbar";

// Every page nested here requires a signed-in user (mirrors the old CRA app's
// ProtectedRoute) — the actual enforcement, not just hiding a nav link.
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <RecruitmentNavbar />
      {children}
    </div>
  );
}
