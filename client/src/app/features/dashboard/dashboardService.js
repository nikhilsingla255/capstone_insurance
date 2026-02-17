import apiClient from "../../../app/services/apiClient";

// Define all LOBs
const ALL_LOBS = ["HEALTH", "MOTOR", "LIFE", "PROPERTY"];

// Normalize exposure data to include all LOBs even if they have no data
const normalizeExposureData = (data) => {
  const dataByLOB = {};
  data.forEach(item => {
    dataByLOB[item._id] = item;
  });
  
  return ALL_LOBS.map(lob => 
    dataByLOB[lob] || {
      _id: lob,
      totalSumInsured: 0,
      totalPremium: 0,
      policyCount: 0
    }
  );
};

export const fetchExposureLOB = async () => {
  const res = await apiClient.get("/dashboard/exposure-lob");
  return normalizeExposureData(res.data);
};

export const fetchLossRatio = async () => {
  const res = await apiClient.get("/dashboard/loss-ratio");
  return res.data;
};

export const fetchRetentionVsCeded = async () => {
  const res = await apiClient.get("/dashboard/retention-vs-ceded");
  return res.data;
};

export const fetchReinsurerDistribution = async () => {
  const res = await apiClient.get("/dashboard/reinsurer-distribution");
  return res.data;
};