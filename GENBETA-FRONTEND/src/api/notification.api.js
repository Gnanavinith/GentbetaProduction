import api from "./api";

export const notificationApi = {
  // Get all notifications
  getNotifications: async () => {
    const response = await api.get('/api/notifications');
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (id) => {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
  },
};