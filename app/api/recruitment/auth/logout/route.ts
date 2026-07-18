export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/recruitment/config";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(config.sessionCookieName);
  return NextResponse.json({ ok: true });
}
