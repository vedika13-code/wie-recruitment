function parseAllowlist(raw) {
  const map = new Map();
  if (!raw) return map;
  for (const entry of raw.split(",")) {
    const [email, role] = entry.split(":").map((s) => s.trim());
    if (email && role) map.set(email.toLowerCase(), role);
  }
  return map;
}

module.exports = {
  port: process.env.PORT || 4000,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  collegeEmailDomain: process.env.COLLEGE_EMAIL_DOMAIN,
  sessionSecret: process.env.SESSION_SECRET,
  sessionCookieName: "wie_session",
  adminAllowlist: parseAllowlist(process.env.ADMIN_ALLOWLIST),
  // Double-gated on purpose: NODE_ENV must not be 'production' AND the flag must be
  // explicitly true. Either one being unset/false is enough to keep this off.
  enableDevLogin:
    process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_LOGIN === "true",
};
