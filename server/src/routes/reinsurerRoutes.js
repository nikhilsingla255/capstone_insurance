const express = require("express");
const router = express.Router();
const reinsurerController = require("../controllers/reinsurerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

// GET all reinsurers - accessible to all authenticated users
router.get("/", protect, reinsurerController.getReinsurers);

// GET single reinsurer by ID - accessible to all authenticated users
router.get("/:id", protect, reinsurerController.getReinsurerById);

// CREATE reinsurer - REINSURANCE_ANALYST only
router.post("/", protect, authorize("REINSURANCE_ANALYST"), reinsurerController.createReinsurer);

// UPDATE reinsurer - REINSURANCE_ANALYST only
router.put("/:id", protect, authorize("REINSURANCE_ANALYST"), reinsurerController.updateReinsurer);

// DELETE reinsurer - REINSURANCE_ANALYST only
router.delete("/:id", protect, authorize("REINSURANCE_ANALYST"), reinsurerController.deleteReinsurer);

module.exports = router;