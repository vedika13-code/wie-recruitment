import "server-only";
import jwt from "jsonwebtoken";
import { config } from "./config";

export type SessionPayload = { userId: string };

export function signSession(user: { id: string }): string {
  return jwt.sign({ userId: user.id }, config.sessionSecret, { expiresIn: "30d" });
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, config.sessionSecret) as SessionPayload; // throws if invalid/expired
}
