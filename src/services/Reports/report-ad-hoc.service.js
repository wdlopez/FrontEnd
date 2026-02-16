import { apiNotifications } from '../../config/api';

const ReportService = {
  getAllReports: async () => {
    const response = await apiNotifications.get('/saved-ad-hoc-report');
    return response.data; 
  },

  getReportById: async (reportId) => {
    const response = await apiNotifications.get(`/saved-ad-hoc-report/${reportId}`);
    return response.data;
  },

  createReport: async (reportData) =>{
    const response = await apiNotifications.post('/saved-ad-hoc-report', reportData);
    return response.data;
  },

  updateReport: async (id, reportData) => {
    const response = await apiNotifications.put(`/saved-ad-hoc-report/${id}`, reportData);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await apiNotifications.delete(`/saved-ad-hoc-report/${id}`);
    return response.data;
  },
};

export default ReportService;