import { apiNotifications } from '../../config/api';

const NotificationService = {
  getAllNotifications: async () => {
    const response = await apiNotifications.get('/notification');
    return response.data; 
  },

  getNotificationById: async (notificationId) => {
    const response = await apiNotifications.get(`/notification/${notificationId}`);
    return response.data;
  },

  createNotification: async (notificationData) =>{
    const response = await apiNotifications.post('/notification', notificationData);
    return response.data;
  },

  updateNotification: async (id, notificationData) => {
    const response = await apiNotifications.put(`/notification/${id}`, notificationData);
    return response.data;
  },

  updateNotificationStatus: async (id, status) => {
    const response = await apiNotifications.patch(`/notification/status/${id}`, { status });
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiNotifications.delete(`/notification/${id}`);
    return response.data;
  },
};

export default NotificationService;