import apiClient from "../../../app/services/apiClient";

// Get all treaties
export const getTreaties = async () => {
  const res = await apiClient.get("/treaties");
  return res.data;
};

// Get single treaty
export const getTreatyById = async (id) => {
  const res = await apiClient.get(`/treaties/${id}`);
  return res.data;
};

// Create treaty
export const createTreaty = async (data) => {
  const res = await apiClient.post("/treaties", data);
  return res.data;
};

// Update treaty
export const updateTreaty = async (id, data) => {
  const res = await apiClient.put(`/treaties/${id}`, data);
  return res.data;
};

// Delete treaty
export const deleteTreaty = async (id) => {
  const res = await apiClient.delete(`/treaties/${id}`);
  return res.data;
};
