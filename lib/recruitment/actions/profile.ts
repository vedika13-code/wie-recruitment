"use server";

import prisma from "@/lib/recruitment/db";
import { requireAuth } from "@/lib/recruitment/auth";
import { assertActiveCycleDeadline } from "@/lib/recruitment/cycle";
import { actionOk, actionErrFromCaught, type ActionResult } from "@/lib/recruitment/actionResult";
import type { User } from "@/generated/prisma";

// Fields an applicant may edit about themselves. Deliberately excludes email/role —
// email is tied to the Google identity, role is admin-managed only.
const EDITABLE_FIELDS = [
  "name",
  "phone",
  "regNo",
  "branch",
  "specialization",
  "age",
  "residenceType",
  "githubUrl",
  "linkedinUrl",
  "portfolioUrl",
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];

export type ProfileFormInput = Partial<Record<EditableField, string>>;

export type ProfileResponse = Pick<User, "id" | "email" | "role" | EditableField>;

function toProfileResponse(user: User): ProfileResponse {
  const picked = Object.fromEntries(
    EDITABLE_FIELDS.map((key) => [key, user[key]] as const)
  ) as Pick<User, EditableField>;
  return { id: user.id, email: user.email, role: user.role, ...picked };
}

export async function updateProfileAction(
  input: ProfileFormInput
): Promise<ActionResult<ProfileResponse>> {
  try {
    const user = await requireAuth();
    await assertActiveCycleDeadline("applicationDeadline");

    const data: Record<string, string | number | null> = {};
    for (const key of EDITABLE_FIELDS) {
      if (input[key] !== undefined) data[key] = input[key];
    }
    if (data.age !== undefined) {
      data.age = data.age === "" ? null : Number(data.age);
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return actionOk(toProfileResponse(updated));
  } catch (err) {
    return actionErrFromCaught(err);
  }
}
