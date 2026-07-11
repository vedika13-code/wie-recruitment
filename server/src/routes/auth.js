const { Router } = require("express");
const prisma = require("../db");
const config = require("../config");
const { verifyGoogleIdToken } = require("../services/googleAuth");
const { signSession } = require("../services/session");

const router = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, matches session JWT expiry
};

router.post("/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "idToken is required" });

  let payload;
  try {
    payload = await verifyGoogleIdToken(idToken);
  } catch {
    return res.status(401).json({ error: "Invalid Google token" });
  }

  const email = payload.email?.toLowerCase();
  const isCollegeEmail =
    payload.email_verified && email?.endsWith(`@${config.collegeEmailDomain}`);
  if (!isCollegeEmail) {
    return res
      .status(403)
      .json({ error: `Use your @${config.collegeEmailDomain} email` });
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const role = config.adminAllowlist.get(email) || "applicant";
    user = await prisma.user.create({
      data: { email, googleId: payload.sub, name: payload.name, role },
    });
  }

  const token = signSession(user);
  res.cookie(config.sessionCookieName, token, cookieOptions);
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.post("/logout", (req, res) => {
  res.clearCookie(config.sessionCookieName);
  res.json({ ok: true });
});

module.exports = router;
