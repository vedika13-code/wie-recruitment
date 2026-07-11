const { OAuth2Client } = require("google-auth-library");
const config = require("../config");

const client = new OAuth2Client(config.googleClientId);

// Verifies the ID token's signature and audience against Google's public keys,
// so a forged/self-issued token gets rejected here, not trusted.
async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });
  return ticket.getPayload(); // { email, email_verified, name, sub, ... }
}

module.exports = { verifyGoogleIdToken };
