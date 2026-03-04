import api from '../../config/api';

const ClientService = {

  getAll: async (params = {}) => {
    if (import.meta.env.DEV) {
      console.debug("[ClientService.getAll] params:", params);
    }
    const response = await api.get("/client", { params });
    return response.data;
  },

  getAllDeleted: async (params = {}) => {
    if (import.meta.env.DEV) {
      console.debug("[ClientService.getAllDeleted] params:", params);
    }
    const response = await api.get("/client/deleted", { params });
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

  restore: async (id) => {
    const response = await api.patch(`/client/recovery/${id}`);
    return response.data;
  },

  // Mantener alias (Opcional)
  getAllClients: (params) => ClientService.getAll(params),
  getAllDeletedClients: (params) => ClientService.getAllDeleted(params),
  getClientById: (id) => ClientService.getById(id),
  createClient: (data) => ClientService.create(data),
  updateClient: (id, data) => ClientService.update(id, data),
  deleteClient: (id) => ClientService.delete(id),
  restoreClient: (id) => ClientService.restore(id),
};

export default ClientService;