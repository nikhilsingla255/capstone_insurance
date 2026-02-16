const Policy = require("../models/Policy");
const AuditLog = require('../models/AuditLog');

const { reinsuranceEngine } = require('../services/reinsuranceEngine');

exports.createPolicy = async (req, res) => {
  try {
    const createdBy = req.user._id;
    const policy = await Policy.create({
      ...req.body,
      createdBy
    });

    await AuditLog.create({
      entityType: "POLICY",
      entityId: policy._id,
      action: "CREATE",
      oldValue: null,
      newValue: policy,
      performedBy: req.user._id,
      ipAddress: req.ip
    });

    res.status(201).json(policy);
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
};

exports.getPolicies = async (req, res) => {
  const policies = await Policy.find();
  res.json(policies);
};

exports.getPolicyById = async (req, res) => {
  const policy = await Policy.findById(req.params.id);
  if (!policy) return res.status(404).json({ message: "Policy not found" });
  res.json(policy);
};

exports.updatePolicy = async (req, res) => {
  const oldPolicy = await Policy.findById(req.params.id);
  const oldValue = oldPolicy.toObject(); // Convert to plain object for audit log
  
  const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  await AuditLog.create({
      entityType: "POLICY",
      entityId: policy._id,
      action: "UPDATE",
      oldValue: oldValue,
      newValue: policy,
      performedBy: req.user._id,
      ipAddress: req.ip
    });

  res.json(policy);
};

exports.deletePolicy = async (req, res) => {
  const policy = await Policy.findById(req.params.id);
  
  if (!policy) {
    return res.status(404).json({ message: "Policy not found" });
  }
  
  await Policy.findByIdAndDelete(req.params.id);
  
  // Audit log for deletion
  await AuditLog.create({
    entityType: "POLICY",
    entityId: policy._id,
    action: "DELETE",
    oldValue: policy,
    newValue: null,
    performedBy: req.user._id,
    ipAddress: req.ip
  });
  
  res.json({ message: "Policy deleted" });
};

exports.approvePolicy = async (req, res) => {
  try {
    const { policyNumber } = req.params;
    const userId = req.user._id;
    const policy = await Policy.findOne({ policyNumber });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    if (policy.status !== "DRAFT") {
      return res.status(400).json({
        message: `Policy is not in DRAFT state. Current state: ${policy.status}`
      });
    }

    // Capture old state before changes
    const oldValue = policy.toObject();
    
    policy.status = "ACTIVE";
    policy.approvedBy = userId;
    await policy.save();

    await AuditLog.create({
      entityType: "POLICY",
      entityId: policy._id,
      action: "APPROVE",
      oldValue: oldValue,
      newValue: policy,
      performedBy: req.user._id,
      ipAddress: req.ip
    });
    
    const allocation = await reinsuranceEngine(policy, userId);
    
    return res.status(200).json({
      message: "Policy approved successfully",
      allocation
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
};