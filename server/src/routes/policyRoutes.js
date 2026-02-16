const express = require("express");
const router = express.Router();
const policyController = require("../controllers/policyController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

router.post(
  "/",
  protect,
  authorize("UNDERWRITER"),
  policyController.createPolicy,
);
router.get(
  "/",
  protect,
  authorize("UNDERWRITER" , "CLAIMS_ADJUSTER"),
  policyController.getPolicies,
);
router.get(
  "/:id",
  protect,
  authorize("UNDERWRITER"),
  policyController.getPolicyById,
);
router.put(
  "/:id",
  protect,
  authorize("UNDERWRITER"),
  policyController.updatePolicy,
);
router.delete(
  "/:id",
  protect,
  authorize("UNDERWRITER"),
  policyController.deletePolicy,
);
router.post(
  "/:policyNumber/approve",
  protect,
  authorize("UNDERWRITER"),
  policyController.approvePolicy,
);

module.exports = router;