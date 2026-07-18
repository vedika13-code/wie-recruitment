import { redirect } from "next/navigation";
import { getSession } from "@/lib/recruitment/auth";
import { config } from "@/lib/recruitment/config";
import GlassCard from "@/components/ui/GlassCard";
import GoogleSignInButton from "@/components/recruitment/GoogleSignInButton";
import DevLoginForm from "@/components/recruitment/DevLoginForm";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <GlassCard>
        <h1 className="text-2xl font-bold text-white">Login</h1>
        <p className="mt-2 text-sm text-white/70">
          Sign in with your VIT Google account.
        </p>

        <div className="mt-6">
          <GoogleSignInButton clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""} />
        </div>

        {config.enableDevLogin && <DevLoginForm />}
      </GlassCard>
    </main>
  );
}
