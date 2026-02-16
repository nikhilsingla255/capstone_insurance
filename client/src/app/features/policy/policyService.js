import apiClient from "../../../app/services/apiClient";

export const getPolicies = async () => {
  const res = await apiClient.get("/policies");
  return res.data;
};

export const getPolicyById = async (id) => {
  const res = await apiClient.get(`/policies/${id}`);
  return res.data;
};

export const createPolicy = async (data) => {
  const res = await apiClient.post("/policies", data);
  return res.data;
};

export const updatePolicy = async (id, data) => {
  const res = await apiClient.put(`/policies/${id}`, data);
  return res.data;
};

export const deletePolicy = async (id) => {
  const res = await apiClient.delete(`/policies/${id}`);
  return res.data;
};

// ⭐ KEY: Backend expects policyNumber in URL, returns { message, allocation }
export const approvePolicy = async (policyNumber) => {
  const res = await apiClient.post(`/policies/${policyNumber}/approve`);
  return res.data;
};

export const rejectPolicy = async (id) => {
  const res = await apiClient.post(`/policies/${id}/reject`);
  return res.data;
};