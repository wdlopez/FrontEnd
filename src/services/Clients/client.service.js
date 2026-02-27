import api from '../../config/api';

const ClientService = {

  getAll: async (params = {}) => {
    if (import.meta.env.DEV) {
      console.debug("[ClientService.getAll] params:", params);
    }
    const response = await api.get("/client", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/client/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/client', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/client/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/client/${id}`);
    return response.data;
  },

  // Mantener alias (Opcional)
  getAllClients: (params) => ClientService.getAll(params),
  getClientById: (id) => ClientService.getById(id),
  createClient: (data) => ClientService.create(data),
  updateClient: (id, data) => ClientService.update(id, data),
  deleteClient: (id) => ClientService.delete(id),
};

export default ClientService;