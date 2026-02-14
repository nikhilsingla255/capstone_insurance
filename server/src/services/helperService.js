// const Policy = require("../models/Policy");
// const Treaty = require("../models/Treaty");
// const RiskAllocation = require("../models/RiskAllocation");

// exports.calculateExposure = async (policyId) => {
//   const policy = await Policy.findById(policyId);
//   if (!policy) throw new Error("Policy not found");
//   return {
//     policyId,
//     exposure: policy.sumInsured,
//   };
// };

// exports.calculateRetention = async (policyId) => {
//   const policy = await Policy.findById(policyId);
//   if (!policy) throw new Error("Policy not found");
//   const exposure = policy.sumInsured;
//   const retentionLimit = policy.retentionLimit || 0;
//   const retained = Math.min(exposure, retentionLimit);
//   const ceded = exposure - retained;
//   return {
//     policyId,
//     exposure,
//     retentionLimit,
//     retained,
//     ceded,
//   };
// };

// exports.allocateTreaties = async (policyId, userId) => {
//   const policy = await Policy.findById(policyId);
//   if (!policy) throw new Error("Policy not found");

//   const exposure = policy.sumInsured;
//   const retentionLimit = policy.retentionLimit || 0;

//   const retained = Math.min(exposure, retentionLimit);
//   const ceded = exposure - retained;

//   if (ceded <= 0) {
//     return {
//       message: "No reinsurance required",
//       retainedExposure: retained,
//       allocations: [],
//     };
//   }

//   // Fetch treaties applicable to line of business
//   const treaties = await Treaty.find({
//     status: "ACTIVE",
//     applicableLOBs: policy.lineOfBusiness,
//   }).populate("reinsurerId");

//   if (!treaties.length) {
//     throw new Error("No active treaties found");
//   }

//   let allocations = [];
//   let balance = ceded;

//   for (const treaty of treaties) {
//     if (balance <= 0) break;

//     const sharePercent = treaty.sharePercentage / 100;
//     let allocatedValue = ceded * sharePercent;

//     // Enforce treaty limit
//     if (allocatedValue > treaty.treatyLimit) {
//       allocatedValue = treaty.treatyLimit;
//     }

//     allocations.push({
//       reinsurerId: treaty.reinsurerId._id,
//       treatyId: treaty._id,
//       allocatedAmount: allocatedValue,
//       allocatedPercentage: treaty.sharePercentage,
//     });

//     balance -= allocatedValue;
//   }
//   // Save Risk Allocation Record
//   const riskAllocation = await RiskAllocation.create({
//     policyId,
//     allocations,
//     retainedAmount: retained,
//     calculatedAt: new Date(),
//     calculatedBy: userId,
//   });
//   return riskAllocation;
// };

// exports.getTotalExposure = async () => {
//   const result = await Policy.aggregate([
//     { $match: { status: "ACTIVE" } },
//     { $group: { _id: null, totalExposure: { $sum: "$sumInsured" } } },
//   ]);
//   return result[0]?.totalExposure || 0;
// };