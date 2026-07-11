const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { getActiveCycle } = require("../services/cycle");

const router = Router();

router.get("/active", requireAuth, async (req, res) => {
  const cycle = await getActiveCycle();
  res.json({
    name: cycle.name,
    status: cycle.status,
    applicationDeadline: cycle.applicationDeadline,
    taskDeadline: cycle.taskDeadline,
  });
});

module.exports = router;
