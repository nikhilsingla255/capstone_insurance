const express = require("express");
const router = express.Router();
const reinsurerController = require("../controllers/reinsurerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

router.post(
  "/",
  protect,
  authorize("REINSURANCE_ANALYST"),
  reinsurerController.createReinsurer,
);
router.get(
  "/",
  protect,
  authorize("REINSURANCE_ANALYST"),
  reinsurerController.getReinsurers,
);
router.put(
  "/:id",
  protect,
  authorize("REINSURANCE_ANALYST"),
  reinsurerController.updateReinsurer,
);

module.exports = router;