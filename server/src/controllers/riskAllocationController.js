const RiskAllocation = require("../models/RiskAllocation");

exports.getAllocations = async (req, res) => {
  const allocations = await RiskAllocation.find()
    .populate("policyId")
    .populate("allocations.reinsurerId");
  res.json(allocations);
};

exports.getAllocationByPolicy = async (req, res) => {
  const allocation = await RiskAllocation.findOne({
    policyId: req.params.policyId,
  });
  res.json(allocation);
};