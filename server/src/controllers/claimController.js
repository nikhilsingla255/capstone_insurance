const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const AuditLog = require("../models/AuditLog");
const { getClientIp } = require('../utils/getClientIp');

exports.createClaim = async (req, res) => {
  try {
    const { claimNumber, policyNumber, claimAmount, incidentDate, reportedDate } = req.body;

    const policy = await Policy.findOne({ policyNumber });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    if (policy.status !== "ACTIVE") {
      return res.status(400).json({ message: "Claim can only be created for ACTIVE policies" });
    }

    if (claimAmount > policy.sumInsured) {
      return res.status(400).json({ message: "Claim amount exceeds policy coverage" });
    }

    const claim = await Claim.create({
      claimNumber,
      policyId: policy._id,
      claimAmount,
      approvedAmount: 0,
      incidentDate,
      reportedDate,
      status: "SUBMITTED"
    });

    await AuditLog.create({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "CREATE",
      oldValue: null,
      newValue: claim,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.status(201).json(claim);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.reviewClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (claim.status !== "SUBMITTED") {
      return res.status(400).json({ message: "Only SUBMITTED claims can move to IN_REVIEW" });
    }

    const oldValue = claim.toObject();

    claim.status = "IN_REVIEW";
    claim.handledBy = req.user._id;
    await claim.save();

    await AuditLog.create({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "UPDATE",
      oldValue,
      newValue: claim,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json(claim);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveClaim = async (req, res) => {
  try {
    const { approvedAmount, remarks } = req.body;

    const claim = await Claim.findById(req.params.id);

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (claim.status !== "IN_REVIEW") {
      return res.status(400).json({ message: "Only IN_REVIEW claims can be approved" });
    }

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ message: "Remarks are required when approving a claim" });
    }

    if (approvedAmount > claim.claimAmount) {
      return res.status(400).json({ message: "Approved amount cannot exceed claim amount" });
    }

    const oldValue = claim.toObject();

    claim.status = "APPROVED";
    claim.approvedAmount = approvedAmount;
    claim.remarks = (claim.remarks || "") + "\n" + remarks;
    await claim.save();

    await AuditLog.create({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "APPROVE",
      oldValue,
      newValue: claim,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json(claim);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectClaim = async (req, res) => {
  try {
    const { remarks } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (claim.status !== "IN_REVIEW") {
      return res.status(400).json({ message: "Only IN_REVIEW claims can be rejected" });
    }

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({ message: "Remarks are required when rejecting a claim" });
    }

    const oldValue = claim.toObject();

    claim.status = "REJECTED";
    claim.remarks = (claim.remarks || "") + "\n" + remarks;
    await claim.save();

    await AuditLog.create({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "UPDATE",
      oldValue,
      newValue: claim,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json(claim);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.settleClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (claim.status !== "APPROVED") {
      return res.status(400).json({ message: "Only APPROVED claims can be settled" });
    }

    const oldValue = claim.toObject();

    claim.status = "SETTLED";
    await claim.save();

    await AuditLog.create({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "UPDATE",
      oldValue,
      newValue: claim,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json(claim);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClaims = async (req, res) => {
    try {
        const claims = await Claim.find().populate("policyId");
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

exports.getClaimById = async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id).populate("policyId");
        if (!claim) return res.status(404).json({ message: "Claim not found" });
        res.status(200).json(claim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const oldValue = claim.toObject();
    
    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    await AuditLog.create({
      entityType: "CLAIM",
      entityId: updatedClaim._id,
      action: "UPDATE",
      oldValue,
      newValue: updatedClaim,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json(updatedClaim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const oldValue = claim.toObject();
    
    await Claim.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "DELETE",
      oldValue,
      newValue: null,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json({ message: "Claim deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClaimRemarks = async (req, res) => {
  try {
    const { remarks } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const oldValue = claim.toObject();

    // Append new remarks to existing remarks to preserve history
    claim.remarks = (claim.remarks ? claim.remarks + "\n" : "") + (remarks || "");
    await claim.save();

    await AuditLog.create({
      entityType: "CLAIM",
      entityId: claim._id,
      action: "UPDATE",
      oldValue,
      newValue: claim,
      performedBy: req.user._id,
      ipAddress: getClientIp(req)
    });

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};