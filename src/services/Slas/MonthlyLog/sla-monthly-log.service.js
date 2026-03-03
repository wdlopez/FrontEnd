import { apiSLAs } from '../../../config/api';

const formatPayload = (data) => {
  const payload = { ...data };

  if (payload.month !== undefined && payload.month !== null && payload.month !== '') {
    const parsedMonth = parseInt(payload.month, 10);
    if (!Number.isNaN(parsedMonth)) {
      payload.month = parsedMonth;
    }
  }

  if (
    payload.percentage_value !== undefined &&
    payload.percentage_value !== null &&
    payload.percentage_value !== ''
  ) {
    const parsedPercentage = parseFloat(payload.percentage_value);
    if (!Number.isNaN(parsedPercentage)) {
      payload.percentage_value = parsedPercentage;
    }
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === null) {
      delete payload[key];
    }
  });

  return payload;
};

const SlaMonthlyLogService = {
  getAll: async (params = {}) => {
    const response = await apiSLAs.get('/sla-monthly-log', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiSLAs.get(`/sla-monthly-log/${id}`);
    return response.data;
  },

  create: async (data) => {
    const payload = formatPayload(data);
    const response = await apiSLAs.post('/sla-monthly-log', payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = formatPayload(data);
    const response = await apiSLAs.put(`/sla-monthly-log/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiSLAs.delete(`/sla-monthly-log/${id}`);
    return response.data;
  },
};

export default SlaMonthlyLogService;

