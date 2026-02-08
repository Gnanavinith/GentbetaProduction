import api from "./api";

export const approvalApi = {
  // External links
  sendMultiFormLink: async (data) => {
    try {
      const response = await api.post("/api/approve/send-multi", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getFormByToken: async (token) => {
    try {
      const response = await api.get(`/api/approve/${token}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  submitFormByToken: async (token, data) => {
    try {
      const response = await api.post(`/api/approve/${token}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // Employee workflow
  getAssignedSubmissions: async () => {
    try {
      const response = await api.get("/api/approve/assigned/all");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  processApproval: async (approvalData) => {
    try {
      const response = await api.post("/api/approve/process", approvalData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getEmployeeStats: async () => {
    try {
      const response = await api.get("/api/approve/stats/employee");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // Internal Approval Tasks
  createApprovalTask: async (taskData) => {
    try {
      const response = await api.post("/api/approve/tasks", taskData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getApprovalTasks: async (status) => {
    try {
      const response = await api.get("/api/approve/tasks", { params: { status } });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getApprovalTaskDetails: async (id) => {
    try {
      const response = await api.get(`/api/approve/tasks/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }
};
