import { apiProviders } from '../../../config/api';

const formatPayload = (data) => {
  const payload = { ...data };

  // Normalizar email
  if (payload.email) {
    payload.email = String(payload.email).toLowerCase().trim();
  }

  // Limpiar espacios en nombre, apellido y cargo
  ['first_name', 'last_name', 'position', 'phone'].forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== null) {
      payload[field] = String(payload[field]).trim();
    }
  });

  // Asegurar booleano estricto
  if (payload.is_primary !== undefined && payload.is_primary !== null) {
    if (typeof payload.is_primary === 'string') {
      payload.is_primary =
        payload.is_primary === 'true' ||
        payload.is_primary === '1' ||
        payload.is_primary.toLowerCase() === 'yes';
    } else {
      payload.is_primary = Boolean(payload.is_primary);
    }
  }

  return payload;
};

const ProviderContactService = {
  getAll: async (params = {}) => {
    const response = await apiProviders.get('/provider/contact', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiProviders.get(`/provider/contact/${id}`);
    return response.data;
  },

  create: async (data) => {
    const payload = formatPayload(data);
    const response = await apiProviders.post('/provider/contact', payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = formatPayload(data);
    const response = await apiProviders.put(`/provider/contact/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiProviders.delete(`/provider/contact/${id}`);
    return response.data;
  },

  // Alias para compatibilidad con código existente
  getAllProviders: (params) => ProviderContactService.getAll(params),
  getProviderContactById: (id) => ProviderContactService.getById(id),
  createProviderContact: (data) => ProviderContactService.create(data),
  updateProviderContact: (id, data) => ProviderContactService.update(id, data),
  deleteProviderContact: (id) => ProviderContactService.delete(id),
};

export default ProviderContactService;