import { apiNotifications } from '../../../config/api';

const BestPracticesService = {
  getAllPractices: async () => {
    const response = await apiNotifications.get('/best-practice');
    return response.data; 
  },

  getPracticeById: async (practiceId) => {
    const response = await apiNotifications.get(`/best-practice/${practiceId}`);
    return response.data;
  },

  createPractice: async (practiceData) =>{
    const response = await apiNotifications.post('/best-practice', practiceData);
    return response.data;
  },

  updatePractice: async (id, practiceData) => {
    const response = await apiNotifications.put(`/best-practice/${id}`, practiceData);
    return response.data;
  },

  deletePractice: async (id) => {
    const response = await apiNotifications.delete(`/best-practice/${id}`);
    return response.data;
  },
};

export default BestPracticesService;