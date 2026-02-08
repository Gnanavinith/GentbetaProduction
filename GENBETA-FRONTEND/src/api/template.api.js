import api from "./api";

export const templateApi = {
  getTemplates: async () => {
    const response = await api.get("/api/templates");
    return response.data;
  },
  getTemplateById: async (id) => {
    const response = await api.get(`/api/templates/${id}`);
    return response.data;
  },
  createTemplate: async (templateData) => {
    const response = await api.post("/api/templates", templateData);
    return { ...response.data, success: true };
  },
  updateTemplate: async (id, templateData) => {
    const response = await api.put(`/api/templates/${id}`, templateData);
    return { ...response.data, success: true };
  },
    deleteTemplate: async (id) => {
      const response = await api.delete(`/api/templates/${id}`);
      return { ...response.data, success: true };
    },
    archiveTemplate: async (id) => {
      const response = await api.patch(`/api/templates/${id}/archive`);
      return { ...response.data, success: true };
    },
    restoreTemplate: async (id) => {
      const response = await api.patch(`/api/templates/${id}/restore`);
      return { ...response.data, success: true };
    }
  };
