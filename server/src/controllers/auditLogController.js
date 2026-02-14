const AuditLog = require("../models/AuditLog");

exports.getAuditLogs = async (req, res) => {
  const logs = await AuditLog.find().sort({ performedAt: -1 });
  res.json(logs);
};

exports.getLogsByEntity = async (req, res) => {
  const logs = await AuditLog.find({
    entityId: req.params.entityId,
  });
  res.json(logs);
};