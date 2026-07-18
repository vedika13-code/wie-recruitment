import { getSession } from "@/lib/recruitment/auth";
import { AuthProvider } from "@/components/recruitment/AuthProvider";

// Single per-navigation session read, shared via context to every recruitment page/
// component below — see AuthProvider.tsx for why this replaces per-component getMe().
export default async function RecruitmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <AuthProvider
      user={user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null}
    >
      {children}
    </AuthProvider>
  );
}
