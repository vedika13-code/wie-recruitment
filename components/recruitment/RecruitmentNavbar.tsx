"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

const ADMIN_ROLES = ["admin", "super_admin"];

export default function RecruitmentNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth();

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `transition-colors duration-200 hover:text-white ${
      isActive(path) ? "text-white" : "text-white/70"
    }`;

  const handleLogout = async () => {
    await fetch("/api/recruitment/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="glass-card relative z-20 flex items-center justify-between px-8 py-4">
      <span className="text-lg font-bold tracking-tight text-purple-200">IEEE WIE</span>

      <nav className="hidden items-center gap-8 text-sm md:flex">
        <Link className={linkClass("/")} href="/">
          Home
        </Link>
        <Link className={linkClass("/dashboard")} href="/dashboard">
          Dashboard
        </Link>
        <Link className={linkClass("/apply")} href="/apply">
          Apply
        </Link>
        <Link className={linkClass("/domains-info")} href="/domains-info">
          Domains
        </Link>
        {user && ADMIN_ROLES.includes(user.role) && (
          <>
            <Link className={linkClass("/admin")} href="/admin">
              Admin
            </Link>
            <Link className={linkClass("/admin/task-config")} href="/admin/task-config">
              Task Config
            </Link>
          </>
        )}
        {user?.role === "super_admin" && (
          <Link className={linkClass("/admin/manage-admins")} href="/admin/manage-admins">
            Manage Admins
          </Link>
        )}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="glass-card hover-lift rounded-md px-4 py-2 text-sm text-white/80 hover:text-white"
      >
        Logout
      </button>
    </header>
  );
}
