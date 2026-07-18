"use client";

import { createContext, useContext, type ReactNode } from "react";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
} | null;

const AuthContext = createContext<SessionUser>(null);

// Replaces the CRA app's pattern of every component independently calling getMe() —
// the session is read once, server-side, in app/(recruitment)/layout.tsx, and handed
// down through context from there.
export function AuthProvider({ user, children }: { user: SessionUser; children: ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth(): SessionUser {
  return useContext(AuthContext);
}
