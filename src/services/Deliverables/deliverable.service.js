import { apiDeliverables } from '../../config/api';

const formatPayload = (data) => {
    const payload = { ...data };
    
    // Asegurar que value_penalty sea número
    if (payload.value_penalty !== undefined && payload.value_penalty !== null) {
        payload.value_penalty = Number(payload.value_penalty);
    }

    // Asegurar que penalty sea booleano
    if (payload.penalty !== undefined) {
        payload.penalty = payload.penalty === true || payload.penalty === 'true' || payload.penalty === 1 || payload.penalty === '1';
    }

    // Asegurar que active sea booleano
    if (payload.active !== undefined) {
        payload.active = payload.active === true || payload.active === 'true' || payload.active === 1 || payload.active === '1';
    }

    // Asegurar que comments no sea null, sino string vacío si no viene
    if (payload.comments === undefined || payload.comments === null) {
        payload.comments = "";
    }

    return payload;
};

const DeliverableService = {
  getAll: async (params = {}) => {
    const response = await apiDeliverables.get('/deliverable', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiDeliverables.get(`/deliverable/${id}`);
    return response.data;
  },

  create: async (data) => {
    const payload = formatPayload(data);
    const response = await apiDeliverables.post('/deliverable', payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = formatPayload(data);
    const response = await apiDeliverables.put(`/deliverable/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiDeliverables.delete(`/deliverable/${id}`);
    return response.data;
  },

  // Alias para compatibilidad si es necesario, aunque idealmente deberíamos usar los métodos estándar
  getAllDeliverables: (params) => DeliverableService.getAll(params),
  getDeliverableById: (id) => DeliverableService.getById(id),
  createDeliverable: (data) => DeliverableService.create(data),
  updateDeliverable: (id, data) => DeliverableService.update(id, data),
  deleteDeliverable: (id) => DeliverableService.delete(id),
};

export default DeliverableService;
