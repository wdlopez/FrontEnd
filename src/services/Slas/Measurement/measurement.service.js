import { apiSLAs } from '../../../config/api';

const formatPayload = (data) => {
  const payload = { ...data };

  // Asegurar número con máximo 2 decimales
  if (payload.actual_value !== undefined && payload.actual_value !== null) {
    payload.actual_value = Number(payload.actual_value);
  }

  // Convertir a booleano estricto
  if (payload.is_compliant !== undefined && payload.is_compliant !== null) {
    if (typeof payload.is_compliant === 'string') {
      payload.is_compliant =
        payload.is_compliant === 'true' ||
        payload.is_compliant === '1' ||
        payload.is_compliant === 'yes';
    } else {
      payload.is_compliant = Boolean(payload.is_compliant);
    }
  }

  // Normalizar fecha a formato ISO (solo YYYY-MM-DD)
  if (payload.measurement_date) {
    const date = new Date(payload.measurement_date);
    if (!isNaN(date.getTime())) {
      payload.measurement_date = date.toISOString().split('T')[0];
    }
  }

  // comments es opcional; si no viene, no lo enviamos
  if (payload.comments === undefined || payload.comments === null) {
    delete payload.comments;
  }

  return payload;
};

const MeasurementService = {
  getAll: async (params = {}) => {
    const response = await apiSLAs.get('/sla-measurement', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiSLAs.get(`/sla-measurement/${id}`);
    return response.data;
  },

  create: async (data) => {
    const payload = formatPayload(data);
    const response = await apiSLAs.post('/sla-measurement', payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = formatPayload(data);
    const response = await apiSLAs.put(`/sla-measurement/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiSLAs.delete(`/sla-measurement/${id}`);
    return response.data;
  },

  // Alias para compatibilidad con código legacy
  getAllMeasurements: (params) => MeasurementService.getAll(params),
  getMeasurementById: (id) => MeasurementService.getById(id),
  createMeasurement: (data) => MeasurementService.create(data),
  updateMeasurement: (id, data) => MeasurementService.update(id, data),
  deleteMeasurement: (id) => MeasurementService.delete(id),
};

export default MeasurementService;