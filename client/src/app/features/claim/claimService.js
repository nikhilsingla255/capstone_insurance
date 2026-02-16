import apiClient from "../../services/apiClient";

const API_BASE = "/claims";

export const getClaims = async () => {
  const response = await apiClient.get(API_BASE);
  return response.data;
};

export const getClaimById = async (id) => {
  const response = await apiClient.get(`${API_BASE}/${id}`);
  return response.data;
};

export const createClaim = async (data) => {
  const response = await apiClient.post(API_BASE, data);
  return response.data;
};

export const reviewClaim = async (id) => {
  const response = await apiClient.post(`${API_BASE}/${id}/review`);
  return response.data;
};

export const approveClaim = async (id, approvedAmount, remarks) => {
  const response = await apiClient.post(`${API_BASE}/${id}/approve`, { approvedAmount, remarks });
  return response.data;
};

export const rejectClaim = async (id, remarks) => {
  const response = await apiClient.post(`${API_BASE}/${id}/reject`, { remarks });
  return response.data;
};

export const settleClaim = async (id) => {
  const response = await apiClient.post(`${API_BASE}/${id}/settle`);
  return response.data;
};

export const updateClaimRemarks = async (id, remarks) => {
  const response = await apiClient.patch(`${API_BASE}/${id}/remarks`, { remarks });
  return response.data;
};
