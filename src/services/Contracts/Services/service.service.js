import { apiContracts } from '../../../config/api';

const formatPayload = (data) => {
    const payload = { ...data };
    if (payload.charges_model !== undefined && payload.charges_model !== null) payload.charges_model = Number(payload.charges_model);
    if (payload.baseline !== undefined && payload.baseline !== null) payload.baseline = Number(payload.baseline);
    if (payload.value !== undefined && payload.value !== null) payload.value = Number(payload.value);
    if (payload.sum_total !== undefined && payload.sum_total !== null) payload.sum_total = Number(payload.sum_total);
    // Asegurar que active sea booleano si viene como string "true"/"false" o 1/0
    if (payload.active !== undefined) {
        payload.active = payload.active === true || payload.active === 'true' || payload.active === 1 || payload.active === '1';
    }
    return payload;
};

const ServiceService = {
    getAll: async (params = {}) => {
        const response = await apiContracts.get('/service-contract', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiContracts.get(`/service-contract/${id}`);
        return response.data;
    },

    create: async (data) => {
        const payload = formatPayload(data);
        const response = await apiContracts.post('/service-contract', payload);
        return response.data;
    },

    update: async (id, data) => {
        const payload = formatPayload(data);
        const response = await apiContracts.put(`/service-contract/${id}`, payload);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiContracts.delete(`/service-contract/${id}`);
        return response.data;
    }
};

export default ServiceService;
