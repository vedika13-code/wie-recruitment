import "server-only";
import { cookies } from "next/headers";
import prisma from "./db";
import { config } from "./config";
import { verifySession } from "./session";
import type { User } from "@/generated/prisma";

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(config.sessionCookieName)?.value;
  if (!token) return null;

  let payload;
  try {
    payload = verifySession(token);
  } catch {
    return null;
  }

  return prisma.user.findUnique({ where: { id: payload.userId } });
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getSession();
  if (!user) throw new AuthError("Not signed in", 401);
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (!["admin", "super_admin"].includes(user.role)) throw new AuthError("Forbidden", 403);
  return user;
}

export async function requireSuperAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== "super_admin") throw new AuthError("Forbidden", 403);
  return user;
}
