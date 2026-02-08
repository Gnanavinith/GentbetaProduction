import api from "./api";

export const formTaskApi = {
  getAssignedTasks: async () => {
    try {
      const response = await api.get("/api/tasks/assigned");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getTaskStats: async () => {
    try {
      const response = await api.get("/api/tasks/stats");
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getTaskById: async (taskId) => {
    try {
      const response = await api.get(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  submitTask: async (taskId, data) => {
    try {
      const response = await api.post(`/api/tasks/${taskId}/submit`, { data });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
      }
    },
  
      submitDirect: async (formId, data) => {
        try {
          const response = await api.post(`/api/tasks/submit-direct/${formId}`, { data });
          return response.data;
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        }
      },
    
      createTasks: async (taskData) => {
        try {
          const response = await api.post("/api/tasks", taskData);
          return response.data;
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        }
      },
    };

