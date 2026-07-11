const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const { id, email, name, role } = req.user;
  res.json({ id, email, name, role });
});

module.exports = router;
