export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { UPLOADS_DIR } from "@/lib/recruitment/storage";

// Replaces the old Express app's `express.static(uploadsDir)` — Next.js has no
// directory-auto-serving equivalent, so uploaded files are streamed back explicitly.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const resolved = path.join(UPLOADS_DIR, ...segments);

  // Reject any resolved path that escapes UPLOADS_DIR (path traversal via "..").
  if (!resolved.startsWith(UPLOADS_DIR)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const data = await fs.readFile(resolved);
    return new NextResponse(new Uint8Array(data));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
