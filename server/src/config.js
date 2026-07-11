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
};
