const Claim = require("../models/Claim");

/**
 * Detect fraud indicators in a claim based on multiple factors
 * @param {Object} policy - Policy document
 * @param {Number} claimAmount - Amount being claimed
 * @param {Date} incidentDate - Date of incident
 * @param {Date} reportedDate - Date claim was reported
 * @returns {Object} { fraudIndicators: [], riskLevel: "LOW|MEDIUM|HIGH" }
 */
const detectFraudIndicators = async (policy, claimAmount, incidentDate, reportedDate) => {
  const fraudIndicators = [];
  let riskLevel = "LOW"; // LOW, MEDIUM, HIGH

  // 1. Early claim within 30 days of policy purchase
  const daysSincePolicyCreation = Math.floor(
    (new Date() - new Date(policy.createdAt)) / (1000 * 60 * 60 * 24)
  );
  if (daysSincePolicyCreation <= 30) {
    fraudIndicators.push({
      type: "EARLY_CLAIM",
      message: `Claim filed only ${daysSincePolicyCreation} days after policy purchase (threshold: 30 days)`,
      severity: "HIGH"
    });
    riskLevel = "HIGH";
  }

  // 2. Claim amount equals 100% of sum insured
  const claimPercentage = (claimAmount / policy.sumInsured) * 100;
  if (claimPercentage >= 100) {
    fraudIndicators.push({
      type: "FULL_COVERAGE_CLAIM",
      message: `Claim amount is 100% of sum insured (₹${claimAmount} of ₹${policy.sumInsured})`,
      severity: "MEDIUM"
    });
    if (riskLevel === "LOW") riskLevel = "MEDIUM";
  }

  // 3. Claim amount is a suspicious round number
  if (claimAmount % 10000 === 0 && claimAmount > 100000) {
    fraudIndicators.push({
      type: "ROUND_NUMBER",
      message: `Claim amount is an exact round number (₹${claimAmount}), suggesting possible fabrication`,
      severity: "LOW"
    });
  }

  // 4. Multiple claims on same policy within 90 days
  const recentClaims = await Claim.find({
    policyId: policy._id,
    createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  });
  if (recentClaims.length > 0) {
    fraudIndicators.push({
      type: "FREQUENT_CLAIMS",
      message: `${recentClaims.length} claim(s) already filed on this policy in the last 90 days`,
      severity: "MEDIUM"
    });
    if (riskLevel === "LOW") riskLevel = "MEDIUM";
  }

  // 5. Claim filed close to policy expiry (within 30 days)
  const daysUntilExpiry = Math.floor(
    (new Date(policy.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
    fraudIndicators.push({
      type: "END_OF_TERM_FRAUD",
      message: `Policy expires in ${daysUntilExpiry} days - claim filed near expiry date`,
      severity: "MEDIUM"
    });
    if (riskLevel === "LOW") riskLevel = "MEDIUM";
  }

  // 6. Large gap between incident and reported date (>60 days)
  const daysBetweenDates = Math.floor(
    (new Date(reportedDate) - new Date(incidentDate)) / (1000 * 60 * 60 * 24)
  );
  if (daysBetweenDates > 60) {
    fraudIndicators.push({
      type: "LARGE_REPORTING_GAP",
      message: `Large gap between incident (${new Date(incidentDate).toLocaleDateString()}) and report date (${new Date(reportedDate).toLocaleDateString()}) - ${daysBetweenDates} days`,
      severity: "LOW"
    });
  }

  return { fraudIndicators, riskLevel };
};

module.exports = { detectFraudIndicators };
