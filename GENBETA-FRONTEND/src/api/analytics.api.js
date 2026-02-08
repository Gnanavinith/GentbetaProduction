import api from "./api";

export const analyticsApi = {
  // Get comprehensive dashboard analytics
  getDashboardAnalytics: async (days = 30, plantId = null, companyId = null) => {
    const params = { days };
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/api/analytics/dashboard", { params });
    return response.data;
  },

  // Get submissions per day
  getSubmissionsPerDay: async (days = 30, plantId = null, companyId = null) => {
    const params = { days };
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/api/analytics/submissions-per-day", { params });
    return response.data;
  },

  // Get average approval time
  getAverageApprovalTime: async (days = 30, plantId = null, companyId = null) => {
    const params = { days };
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/api/analytics/average-approval-time", { params });
    return response.data;
  },

  // Get rejection rate
  getRejectionRate: async (days = 30, plantId = null, companyId = null) => {
    const params = { days };
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/api/analytics/rejection-rate", { params });
    return response.data;
  },

  // Get pending by stage
  getPendingByStage: async (plantId = null, companyId = null) => {
    const params = {};
    if (plantId) params.plantId = plantId;
    if (companyId) params.companyId = companyId;
    
    const response = await api.get("/api/analytics/pending-by-stage", { params });
    return response.data;
  },

    // Get plant-wise statistics
    getPlantWiseStats: async (companyId = null) => {
      const params = {};
      if (companyId) params.companyId = companyId;
      
      const response = await api.get("/api/analytics/plant-wise-stats", { params });
      return response.data;
    },

    // Get approvals by employee
    getApprovalsByEmployee: async (days = 30, plantId = null, companyId = null) => {
      const params = { days };
      if (plantId) params.plantId = plantId;
      if (companyId) params.companyId = companyId;
      
      const response = await api.get("/api/analytics/approvals-by-employee", { params });
      return response.data;
    },
    
    // Get approvers performance metrics
    getApproversPerformance: async (days = 30, plantId = null, companyId = null) => {
      const params = { days };
      if (plantId) params.plantId = plantId;
      if (companyId) params.companyId = companyId;
      
      const response = await api.get("/api/analytics/approvers-performance", { params });
      return response.data;
    },
    
    // Get approvers workload distribution
    getApproversWorkload: async (plantId = null, companyId = null) => {
      const params = {};
      if (plantId) params.plantId = plantId;
      if (companyId) params.companyId = companyId;
      
      const response = await api.get("/api/analytics/approvers-workload", { params });
      return response.data;
    },
    
    // Get super admin analytics
    getSuperAdminAnalytics: async (days = 30, plantId = null, companyId = null) => {
      const params = { days };
      if (plantId) params.plantId = plantId;
      if (companyId) params.companyId = companyId;
      
      const response = await api.get("/api/analytics/super-admin", { params });
      return response.data;
    }
  };

