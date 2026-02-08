import api from "./api";

export const submissionApi = {
  // Create a new submission
  createSubmission: async (formId, data, status = "DRAFT") => {
    const formData = new FormData();
    formData.append('formId', formId);
    formData.append('data', JSON.stringify(data));
    formData.append('status', status);
    
    const response = await api.post("/api/submissions", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },

  // Get all submissions with filtering and pagination
  getSubmissions: async (params = {}) => {
    const response = await api.get("/api/submissions", { params });
    return response.data;
  },

  // Get submission by ID
  getSubmissionById: async (id) => {
    const response = await api.get(`/api/submissions/${id}`);
    return response.data;
  },

  // Update submission (drafts only)
  updateSubmission: async (id, data) => {
    const response = await api.put(`/api/submissions/${id}`, data);
    return response.data;
  },

  // Submit a draft submission
  submitDraft: async (id) => {
    const response = await api.patch(`/api/submissions/${id}/submit`);
    return response.data;
  },

  // Delete submission (drafts only)
  deleteSubmission: async (id) => {
    const response = await api.delete(`/api/submissions/${id}`);
    return response.data;
  },

  // Get submission statistics
  getStats: async () => {
    const response = await api.get("/api/submissions/stats");
    return response.data;
  }
};