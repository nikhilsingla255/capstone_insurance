import apiClient from "../../services/apiClient";

const API_BASE = "/reinsurers";

export const getReinsurers = async () => {
  const response = await apiClient.get(API_BASE);
  return response.data;
};

export const getReinsurerById = async (id) => {
  const response = await apiClient.get(`${API_BASE}/${id}`);
  return response.data;
};

export const createReinsurer = async (data) => {
  const response = await apiClient.post(API_BASE, data);
  return response.data;
};

export const updateReinsurer = async (id, data) => {
  const response = await apiClient.put(`${API_BASE}/${id}`, data);
  return response.data;
};

export const deleteReinsurer = async (id) => {
  const response = await apiClient.delete(`${API_BASE}/${id}`);
  return response.data;
};
