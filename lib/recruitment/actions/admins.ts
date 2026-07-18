"use server";

import prisma from "@/lib/recruitment/db";
import { requireSuperAdmin } from "@/lib/recruitment/auth";
import { actionOk, actionErr, actionErrFromCaught, type ActionResult } from "@/lib/recruitment/actionResult";

const ADMIN_MANAGED_ROLES = ["admin", "super_admin"];

export type AdminListItem = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  addedBy: string | null;
};

// Not itself gated here — every caller (the page, and the three actions below) is
// already behind the /admin/manage-admins layout's requireSuperAdmin() guard.
export async function listAdmins(): Promise<AdminListItem[]> {
  const admins = await prisma.user.findMany({
    where: { role: { in: ADMIN_MANAGED_ROLES } },
    include: { addedBy: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return admins.map((a) => ({
    id: a.id,
    email: a.email,
    name: a.name,
    role: a.role,
    addedBy: a.addedBy ? a.addedBy.name || a.addedBy.email : null,
  }));
}

export async function addAdminAction(
  email: string,
  role: string
): Promise<ActionResult<{ id: string; email: string; role: string }>> {
  try {
    const superAdmin = await requireSuperAdmin();
    if (!email) return actionErr(400, "email is required");
    if (!ADMIN_MANAGED_ROLES.includes(role)) {
      return actionErr(400, "role must be admin or super_admin");
    }
    const normalizedEmail = email.toLowerCase();

    // Upsert, not create-only: works whether the person has ever signed in before
    // (updates their existing role) or hasn't (pre-creates the record, so their
    // eventual first Google/dev sign-in finds it and skips the allowlist check
    // entirely — same mechanism as the hardcoded 2026 allowlist bootstrap).
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: { role, addedById: superAdmin.id },
      create: { email: normalizedEmail, role, addedById: superAdmin.id },
    });

    return actionOk({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}

export async function removeAdminAction(id: string): Promise<ActionResult<{ id: string; role: string }>> {
  try {
    const superAdmin = await requireSuperAdmin();
    if (id === superAdmin.id) {
      return actionErr(400, "You cannot remove your own admin access");
    }

    // Only ever flips role back down — the user row must never be deleted, since
    // Submission.reviewerNotes and InterviewSlot.createdById attribution must survive
    // removal (see docs/DECISIONS.md).
    const user = await prisma.user.update({
      where: { id },
      data: { role: "applicant" },
    });

    return actionOk({ id: user.id, role: user.role });
  } catch (err) {
    return actionErrFromCaught(err);
  }
}
