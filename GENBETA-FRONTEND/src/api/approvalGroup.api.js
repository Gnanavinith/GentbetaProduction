import api from "./api";

export const approvalGroupApi = {
  // Get all approval groups
  getGroups: async (plantId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/api/approval-groups?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching approval groups:", error);
      throw error;
    }
  },

  // Get single approval group by ID
  // Aliased as both getGroupById (used in ApprovalHistory/Detail)
  // and getGroup (used in EditApprovalGroupPage)
  getGroupById: async (groupId) => {
    try {
      const response = await api.get(`/api/approval-groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching approval group:", error);
      throw error;
    }
  },

  getGroup: async (groupId) => {
    try {
      const response = await api.get(`/api/approval-groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching approval group:", error);
      throw error;
    }
  },

  // Create new approval group
  createGroup: async (groupData) => {
    try {
      const response = await api.post("/api/approval-groups", groupData);
      return response.data;
    } catch (error) {
      console.error("Error creating approval group:", error);
      throw error;
    }
  },

  // Update approval group
  updateGroup: async (groupId, groupData) => {
    try {
      const response = await api.put(`/api/approval-groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      console.error("Error updating approval group:", error);
      throw error;
    }
  },

  // Delete approval group
  deleteGroup: async (groupId) => {
    try {
      const response = await api.delete(`/api/approval-groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting approval group:", error);
      throw error;
    }
  },

  // Get groups where user is a member
  getMyGroups: async () => {
    try {
      const response = await api.get("/api/approval-groups/my-groups");
      return response.data;
    } catch (error) {
      console.error("Error fetching user groups:", error);
      throw error;
    }
  }
};