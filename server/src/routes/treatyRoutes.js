const express = require("express");
const router = express.Router();
const treatyController = require("../controllers/treatyController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

// Create treaty
router.post(
  "/",
  protect,
  authorize("REINSURANCE_ANALYST", "ADMIN"),
  treatyController.createTreaty,
);

// Get all treaties
router.get(
  "/",
  protect,
  authorize("REINSURANCE_ANALYST", "ADMIN", "UNDERWRITER", "CLAIMS_ADJUSTER"),
  treatyController.getTreaties,
);

// Get single treaty
router.get(
  "/:id",
  protect,
  authorize("REINSURANCE_ANALYST", "ADMIN", "UNDERWRITER", "CLAIMS_ADJUSTER"),
  treatyController.getTreatyById,
);

// Update treaty
router.put(
  "/:id",
  protect,
  authorize("REINSURANCE_ANALYST", "ADMIN"),
  treatyController.updateTreaty,
);

// Delete treaty
router.delete(
  "/:id",
  protect,
  authorize("REINSURANCE_ANALYST", "ADMIN"),
  treatyController.deleteTreaty,
);

module.exports = router;