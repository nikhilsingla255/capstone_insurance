const express = require("express");
const router = express.Router();
const riskAllocationController = require("../controllers/riskAllocationController");

router.get("/", riskAllocationController.getAllocations);
router.get("/policy/:policyId", riskAllocationController.getAllocationByPolicy);

module.exports = router;