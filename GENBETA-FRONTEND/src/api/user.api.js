import api from "./api";

export const userApi = {
  getProfile: async () => {
    try {
      const response = await api.get("/api/users/profile");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get("/api/users");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post("/api/users", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put("/api/users/profile", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },

  createEmployee: async (employeeData) => {
    try {
      const response = await api.post("/api/users/employees", employeeData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getPlantEmployees: async (plantId) => {
    try {
      const response = await api.get(`/api/users/plant/${plantId}/employees`);
      const result = response.data;
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: true, data: Array.isArray(result) ? result : [] };
    } catch (error) {
      console.error("getPlantEmployees error:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getSubscriptionUsage: async () => {
    try {
      const response = await api.get('/api/subscription/usage');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },
};