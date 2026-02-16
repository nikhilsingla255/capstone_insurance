import apiClient from "../../../app/services/apiClient";

// Get risk allocation for a specific policy
export const getRiskAllocation = async (policyId) => {
  const res = await apiClient.get(`/risk-allocations/policy/${policyId}`);
  return res.data;
};

// Get all treaties
export const getTreaties = async () => {
  const res = await apiClient.get(`/treaties`);
  return res.data;
};

// Get all reinsurers (needed for treaty form dropdown)
export const getReinsurers = async () => {
  const res = await apiClient.get(`/reinsurers`);
  return res.data;
};

// Get single reinsurer
export const getReinsurer = async (id) => {
  const res = await apiClient.get(`/reinsurers/${id}`);
  return res.data;
};
