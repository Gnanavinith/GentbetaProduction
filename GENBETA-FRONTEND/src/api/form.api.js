import api from "./api";

export const formApi = {
  getFacilitys: async () => {
    const response = await api.get("/api/forms");
    return response.data;
  },
  getFacilityById: async (id) => {
    const response = await api.get(`/api/forms/${id}`);
    return response.data;
  },
  createFacility: async (formData) => {
    const response = await api.post("/api/forms", formData);
    return { ...response.data, success: true };
  },
  updateFacility: async (id, formData) => {
    const response = await api.put(`/api/forms/${id}`, formData);
    return { ...response.data, success: true };
  },
  deleteFacility: async (id) => {
    const response = await api.delete(`/api/forms/${id}`);
    return { ...response.data, success: true };
  },
  sendLink: async (formId, email) => {
    const response = await api.post(`/api/forms/${formId}/send-link`, { approverEmail: email });
    return response.data;
  },
  sendMultiFacilityLink: async (formIds, email) => {
    const response = await api.post("/api/approve/send-multi", { formIds, approverEmail: email });
    return response.data;
  },
  archiveFacility: async (id) => {
    const response = await api.patch(`/api/forms/${id}/archive`);
    return { ...response.data, success: true };
  },
  restoreFacility: async (id) => {
    const response = await api.patch(`/api/forms/${id}/restore`);
    return { ...response.data, success: true };
  },
  toggleTemplateStatus: async (id, isTemplate) => {
    const response = await api.patch(`/api/forms/${id}/toggle-template`, { isTemplate });
    return { ...response.data, success: true };
  }
};
