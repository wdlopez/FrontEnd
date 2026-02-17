import { apiNotifications } from '../../../config/api';

const StandarReportService = {
  getAllStandarReports: async () => {
    const response = await apiNotifications.get('/standard-report');
    return response.data; 
  },

  getStandarReportById: async (standarId) => {
    const response = await apiNotifications.get(`/standard-report/${standarId}`);
    return response.data;
  },

  createStandarReport: async (standarData) =>{
    const response = await apiNotifications.post('/standard-report', standarData);
    return response.data;
  },

  updateStandarReport: async (id, standarData) => {
    const response = await apiNotifications.put(`/standard-report/${id}`, standarData);
    return response.data;
  },

  deleteStandarReport: async (id) => {
    const response = await apiNotifications.delete(`/standard-report/${id}`);
    return response.data;
  },
};

export default StandarReportService;