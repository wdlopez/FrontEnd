import { apiNotifications } from '../../../config/api';

const EmailLogService = {
  getAllEmailLogs: async (params = {}) => {
    const response = await apiNotifications.get('/email-log', { params });
    return response.data; 
  },

  getEmailLogById: async (emailLogId) => {
    const response = await apiNotifications.get(`/email-log/${emailLogId}`);
    return response.data;
  },

  createEmailLog: async (emailLogData) => {
    const response = await apiNotifications.post('/email-log', emailLogData);
    return response.data;
  },

  updateEmailLog: async (id, emailLogData) => {
    const response = await apiNotifications.put(`/email-log/${id}`, emailLogData);
    return response.data;
  },

  deleteEmailLog: async (id) => {
    const response = await apiNotifications.delete(`/email-log/${id}`);
    return response.data;
  },
};

export default EmailLogService;