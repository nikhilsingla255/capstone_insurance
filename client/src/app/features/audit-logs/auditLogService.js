import apiClient from "../../services/apiClient";

export const auditLogService = {
  getAllAuditLogs: async () => {
    try {
      const response = await apiClient.get("/audit-logs");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getLogsByEntity: async (entityId) => {
    try {
      const response = await apiClient.get(`/audit-logs/entity/${entityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
