const Policy = require("../models/Policy");
const { allocateTreaties } = require("../services/helperService");

exports.createPolicy = async (req, res) => {
  try {
    const createdBy = req.user._id;
    const policy = await Policy.create({
      ...req.body,
      createdBy
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
  const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(policy);
};

exports.deletePolicy = async (req, res) => {
  await Policy.findByIdAndDelete(req.params.id);
  res.json({ message: "Policy deleted" });
};

exports.approvePolicy = async (req, res) => {
  const { policyId } = req.params;
  const userId = req.user._id;
  // const allocation = await allocateTreaties(policyId, userId);
  const allocation = await reinsuranceEngine(policyId);
  res.json(allocation);
};