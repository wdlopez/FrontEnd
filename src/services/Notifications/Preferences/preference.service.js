import { apiNotifications } from '../../../config/api';

const PreferenceService = {
  getAllPreferences: async () => {
    const response = await apiNotifications.get('/preference');
    return response.data; 
  },

  getPreferenceById: async (preferenceId) => {
    const response = await apiNotifications.get(`/preference/${preferenceId}`);
    return response.data;
  },

  createPreference: async (preferenceData) =>{
    const response = await apiNotifications.post('/preference', preferenceData);
    return response.data;
  },

  updatePreference: async (id, preferenceData) => {
    const response = await apiNotifications.put(`/preference/${id}`, preferenceData);
    return response.data;
  },

  deletePreference: async (id) => {
    const response = await apiNotifications.delete(`/preference/${id}`);
    return response.data;
  },
};

export default PreferenceService;