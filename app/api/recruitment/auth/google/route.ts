export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/recruitment/db";
import { config } from "@/lib/recruitment/config";
import { verifyGoogleIdToken } from "@/lib/recruitment/googleAuth";
import { signSession } from "@/lib/recruitment/session";
import { SESSION_COOKIE_OPTIONS } from "@/lib/recruitment/cookieOptions";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idToken = body?.idToken;
  if (!idToken) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  let payload;
  try {
    payload = await verifyGoogleIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
  }

  if (!payload?.email_verified || !payload.email) {
    return NextResponse.json(
      { error: `Use your @${config.collegeEmailDomain} email` },
      { status: 403 }
    );
  }

  const email = payload.email.toLowerCase();
  if (!email.endsWith(`@${config.collegeEmailDomain}`)) {
    return NextResponse.json(
      { error: `Use your @${config.collegeEmailDomain} email` },
      { status: 403 }
    );
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const role = config.adminAllowlist.get(email) ?? "applicant";
    user = await prisma.user.create({
      data: { email, googleId: payload.sub, name: payload.name, role },
    });
  }

  const token = signSession(user);
  const cookieStore = await cookies();
  cookieStore.set(config.sessionCookieName, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
