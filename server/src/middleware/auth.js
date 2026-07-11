const prisma = require("../db");
const config = require("../config");
const { verifySession } = require("../services/session");

async function requireAuth(req, res, next) {
  const token = req.cookies[config.sessionCookieName];
  if (!token) return res.status(401).json({ error: "Not signed in" });

  let payload;
  try {
    payload = verifySession(token);
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return res.status(401).json({ error: "Invalid session" });

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
