import "server-only";

// Next.js's `cookies().set()` maxAge is in SECONDS (unlike Express's res.cookie, which
// takes milliseconds) — this is one of the few genuine gotchas in this port.
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60, // 30 days, matches session JWT expiry
  path: "/",
};
