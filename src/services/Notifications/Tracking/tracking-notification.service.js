import { apiNotifications } from '../../../config/api';

const TrackingNotificationService = {
  getAllTrackingNotifications: async () => {
    const response = await apiNotifications.get('/tracking');
    return response.data; 
  },

  getTrackingNotificationById: async (trackingId) => {
    const response = await apiNotifications.get(`/tracking/${trackingId}`);
    return response.data;
  },

  createTrackingNotification: async (trackingData) =>{
    const response = await apiNotifications.post('/tracking', trackingData);
    return response.data;
  },

  updateTrackingNotification: async (id, trackingData) => {
    const response = await apiNotifications.put(`/tracking/${id}`, trackingData);
    return response.data;
  },

  deleteTrackingNotification: async (id) => {
    const response = await apiNotifications.delete(`/tracking/${id}`);
    return response.data;
  },
};

export default TrackingNotificationService;