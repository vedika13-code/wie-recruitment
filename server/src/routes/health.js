const { Router } = require("express");
const prisma = require("../db");

const router = Router();

router.get("/", async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok" });
});

module.exports = router;
