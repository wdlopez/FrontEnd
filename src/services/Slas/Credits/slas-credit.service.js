import { apiSLAs } from '../../../config/api';

const formatPayload = (data) => {
  const payload = { ...data };

  // Monto numérico con decimales
  if (payload.credit_amount !== undefined && payload.credit_amount !== null) {
    payload.credit_amount = Number(payload.credit_amount);
  }

  // Número de factura opcional, entero
  if (
    payload.applied_to_invoice !== undefined &&
    payload.applied_to_invoice !== null &&
    payload.applied_to_invoice !== ''
  ) {
    payload.applied_to_invoice = parseInt(payload.applied_to_invoice, 10);
  } else {
    delete payload.applied_to_invoice;
  }

  // Fecha en formato ISO para el backend
  if (payload.credit_date) {
    const date = new Date(payload.credit_date);
    if (!isNaN(date.getTime())) {
      payload.credit_date = date.toISOString();
    }
  }

  return payload;
};

const SlasCreditService = {
  getAll: async (params = {}) => {
    const response = await apiSLAs.get('/sla-credit', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiSLAs.get(`/sla-credit/${id}`);
    return response.data;
  },

  create: async (data) => {
    const payload = formatPayload(data);
    const response = await apiSLAs.post('/sla-credit', payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = formatPayload(data);
    const response = await apiSLAs.put(`/sla-credit/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiSLAs.delete(`/sla-credit/${id}`);
    return response.data;
  },

  // Alias para compatibilidad con código existente
  getAllCredits: (params) => SlasCreditService.getAll(params),
  getCreditById: (id) => SlasCreditService.getById(id),
  createCredit: (data) => SlasCreditService.create(data),
  updateCredit: (id, data) => SlasCreditService.update(id, data),
  deleteCredit: (id) => SlasCreditService.delete(id),
};

export default SlasCreditService;