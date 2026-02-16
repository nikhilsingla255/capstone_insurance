import apiClient from "../../../app/services/apiClient";

export const fetchExposureLOB = async () => {
  const res = await apiClient.get("/dashboard/exposure-lob");
  return res.data;
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