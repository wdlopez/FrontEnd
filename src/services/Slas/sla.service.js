import { apiSLAs } from '../../config/api';

const formatPayload = (data, isCreate = false) => {
    const payload = { ...data };
    
    // Convertir a números
    const numericFields = [
        'expect_target', 'minimun_target', 'report_period', 
        'improvement', 'risk', 'risk_pool', 'type', 
        'months_penality', 'recargo_percentage', 'active'
    ];

    numericFields.forEach(field => {
        if (payload[field] !== undefined && payload[field] !== null) {
            payload[field] = Number(payload[field]);
        }
    });

    // Eliminar 'active' si es creación, ya que el backend no lo permite en el DTO de creación
    if (isCreate) {
        delete payload.active;
    }

    return payload;
};

const SlaService = {
  getAll: async (params = {}) => {
    const response = await apiSLAs.get('/sla', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiSLAs.get(`/sla/${id}`);
    return response.data;
  },

  create: async (data) => {
    const payload = formatPayload(data, true); // true indica que es creación
    const response = await apiSLAs.post('/sla', payload);
    return response.data;
  },

  update: async (id, data) => {
    const payload = formatPayload(data, false);
    const response = await apiSLAs.put(`/sla/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiSLAs.delete(`/sla/${id}`);
    return response.data;
  },
};

export default SlaService;
