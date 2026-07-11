const { Router } = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");
const { assertActiveCycleDeadline } = require("../services/cycle");

const router = Router();

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
];

function toProfileResponse(user) {
  const { id, email, role, ...rest } = user;
  return { id, email, role, ...pick(rest, EDITABLE_FIELDS) };
}

function pick(obj, keys) {
  const out = {};
  for (const key of keys) out[key] = obj[key];
  return out;
}

router.get("/", requireAuth, (req, res) => {
  res.json(toProfileResponse(req.user));
});

router.put("/", requireAuth, async (req, res) => {
  await assertActiveCycleDeadline("applicationDeadline");

  const data = {};
  for (const key of EDITABLE_FIELDS) {
    if (req.body[key] !== undefined) data[key] = req.body[key];
  }
  if (data.age !== undefined) data.age = data.age === "" ? null : Number(data.age);

  const updated = await prisma.user.update({ where: { id: req.user.id }, data });
  res.json(toProfileResponse(updated));
});

module.exports = router;
