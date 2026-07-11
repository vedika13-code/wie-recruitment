const jwt = require("jsonwebtoken");
const config = require("../config");

function signSession(user) {
  return jwt.sign({ userId: user.id }, config.sessionSecret, {
    expiresIn: "30d",
  });
}

function verifySession(token) {
  return jwt.verify(token, config.sessionSecret); // throws if invalid/expired
}

module.exports = { signSession, verifySession };
