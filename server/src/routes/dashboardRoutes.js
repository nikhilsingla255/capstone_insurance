const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require("../middleware/authMiddleware");

router.get('/exposure-lob', protect, dashboardController.getExposureByLOB);

router.get('/reinsurer-distribution', protect, dashboardController.getReinsurerDistribution);

router.get('/loss-ratio', protect, dashboardController.getLossRatio);

router.get('/monthly-claims', protect, dashboardController.getMonthlyClaimsTrend);

router.get('/retention-vs-ceded', protect, dashboardController.getRetentionVsCeded);

router.get('/high-claim-policies', protect, dashboardController.getHighClaimPolicies);

module.exports = router;