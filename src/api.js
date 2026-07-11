const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", // send/receive the session cookie
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getMe() {
  return request("/api/me");
}

export function loginWithGoogle(idToken) {
  return request("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

// DEV ONLY — backend 404s this unless ENABLE_DEV_LOGIN is set, see docs/DECISIONS.md.
export function devLogin(email, role) {
  return request("/api/auth/dev-login", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export function getProfile() {
  return request("/api/profile");
}

export function updateProfile(profile) {
  return request("/api/profile", { method: "PUT", body: JSON.stringify(profile) });
}

export function getDomains() {
  return request("/api/domains");
}

export function getSelectedDomains() {
  return request("/api/applications/domains");
}

export function setSelectedDomains(domainIds) {
  return request("/api/applications/domains", {
    method: "POST",
    body: JSON.stringify({ domainIds }),
  });
}
