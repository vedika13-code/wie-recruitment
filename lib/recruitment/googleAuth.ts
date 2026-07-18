import "server-only";
import { OAuth2Client } from "google-auth-library";
import { config } from "./config";

const client = new OAuth2Client(config.googleClientId);

// Verifies the ID token's signature and audience against Google's public keys, so a
// forged/self-issued token gets rejected here, not trusted.
export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });
  return ticket.getPayload(); // { email, email_verified, name, sub, ... }
}
