const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleGuard");

router.post(
  "/",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.createClaim,
);
router.get(
  "/",
  protect,
  authorize("ADMIN","CLAIMS_ADJUSTER"),
  claimController.getClaims,
);
router.get(
  "/:id",
  protect,
  authorize("ADMIN","CLAIMS_ADJUSTER"),
  claimController.getClaimById,
);
router.post(
  "/:id/review",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.reviewClaim,
);

router.post(
  "/:id/approve",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.approveClaim,
);

router.post(
  "/:id/reject",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.rejectClaim,
);

router.post(
  "/:id/settle",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.settleClaim,
);

router.patch(
  "/:id/remarks",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.updateClaimRemarks,
);
router.delete(
  "/:id",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.deleteClaim,
);
router.patch(
  "/:id/status",
  protect,
  authorize("CLAIMS_ADJUSTER"),
  claimController.updateClaimStatus,
);

module.exports = router;