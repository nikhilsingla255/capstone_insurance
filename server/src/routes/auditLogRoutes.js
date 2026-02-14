const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");

router.get("/", auditLogController.getAuditLogs);
router.get("/entity/:entityId", auditLogController.getLogsByEntity);

module.exports = router;