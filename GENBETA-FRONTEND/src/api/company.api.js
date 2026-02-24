import api from "./api";

export const companyApi = {
  getCompanies: async () => {
    const response = await api.get("/api/companies");
    return response.data.data || response.data;
  },
  getCompanyById: async (id) => {
    const response = await api.get(`/api/companies/${id}`);
    return response.data;
  },
  updateCompany: async (id, companyData) => {
    // Check if companyData contains a File object (logo)
    const hasFile = companyData.logo instanceof File;
    
    if (hasFile) {
      // Use FormData for file upload
      const formData = new FormData();
      Object.keys(companyData).forEach(key => {
        formData.append(key, companyData[key]);
      });
      const response = await api.put(`/api/companies/${id}`, formData);
      return response.data;
    } else {
      // Use JSON for regular data
      const response = await api.put(`/api/companies/${id}`, companyData);
      return response.data;
    }
  },
  updateTemplateFeature: async (companyId, enabled) => {
    console.log("Calling updateTemplateFeature API:", { companyId, enabled });
    try {
      const response = await api.put("/api/companies/template-feature", { companyId, enabled });
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
  updatePlan: async (id, plan, customLimits) => {
    console.log("API: updatePlan called with:", { id, plan, customLimits });
    try {
      const response = await api.put(`/api/companies/${id}/plan`, { plan, customLimits });
      console.log("API: updatePlan response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API: updatePlan error:", error);
      console.error("API: error response:", error?.response?.data);
      throw error;
    }
  },
  getCompanyUsage: async (companyId) => {
    const response = await api.get(`/api/companies/${companyId}/usage`);
    return response.data;
  }
};
