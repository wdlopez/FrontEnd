import { apiSLAs } from '../../../config/api';

const formatPayload = (data) => {
    const payload = { ...data };

    // Asegurar active como número
    if (payload.active !== undefined) {
        payload.active = Number(payload.active);
    }

    // Procesar JSON de exclusiones/inclusiones si vienen como string
    ['exclusions', 'inclusions'].forEach(field => {
        if (typeof payload[field] === 'string') {
            try {
                payload[field] = payload[field] ? JSON.parse(payload[field]) : {};
            } catch (e) {
                console.warn(`Error parseando ${field}:`, e);
                payload[field] = {}; // Fallback seguro
            }
        }
    });

    return payload;
};

const MWindowService = {
  getAll: async (params = {}) => {
    const response = await apiSLAs.get('/measurement-window', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiSLAs.get(`/measurement-window/${id}`);
    return response.data;
  },

  create: async (data) => {
    const payload = formatPayload(data);
    const response = await apiSLAs.post('/measurement-window', payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = formatPayload(data);
    const response = await apiSLAs.put(`/measurement-window/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiSLAs.delete(`/measurement-window/${id}`);
    return response.data;
  },
  
  // Alias para compatibilidad
  getAllWindows: (params) => MWindowService.getAll(params),
  getWindowById: (id) => MWindowService.getById(id),
  createWindow: (data) => MWindowService.create(data),
  updateWindow: (id, data) => MWindowService.update(id, data),
  deleteWindow: (id) => MWindowService.delete(id),
};

export default MWindowService;
