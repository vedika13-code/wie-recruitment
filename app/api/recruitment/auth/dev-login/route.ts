export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/recruitment/db";
import { config } from "@/lib/recruitment/config";
import { signSession } from "@/lib/recruitment/session";
import { SESSION_COOKIE_OPTIONS } from "@/lib/recruitment/cookieOptions";

// Dev-only bypass: skips Google entirely, logs in as any email/role you specify.
// Gated by config.enableDevLogin (NODE_ENV check + explicit opt-in flag) — see
// docs/DECISIONS.md for why this exists and how it's kept out of production.
export async function POST(request: Request) {
  if (!config.enableDevLogin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const email: string | undefined = body?.email;
  const role: string | undefined = body?.role;
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
  const normalizedEmail = email.toLowerCase();

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    const resolvedRole = role || config.adminAllowlist.get(normalizedEmail) || "applicant";
    user = await prisma.user.create({
      data: { email: normalizedEmail, name: "Dev User", role: resolvedRole },
    });
  }

  const token = signSession(user);
  const cookieStore = await cookies();
  cookieStore.set(config.sessionCookieName, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
