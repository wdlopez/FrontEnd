import { apiProviders } from '../../config/api';

const ProviderService = {
  getAll: async (params = {}) => {
    const response = await apiProviders.get('/providers', { params });
    return response.data; 
  },

  getById: async (providerId) => {
    const response = await apiProviders.get(`/providers/${providerId}`);
    return response.data;
  },

  create: async (providerData) =>{
    const response = await apiProviders.post('/providers', providerData);
    return response.data;
  },

  update: async (id, providerData) => {
    const response = await apiProviders.put(`/providers/${id}`, providerData);
    return response.data;
  },

  
  delete: async (id) => {
    const response = await apiProviders.delete(`/providers/${id}`);
    return response.data;
  },

  restore: async (id) => {
    const response = await apiProviders.patch(`/providers/${id}/restore`);
    return response.data;
  },

  getAllProviders: (params) => ProviderService.getAll(params),
  getProviderById: (id) => ProviderService.getById(id),
  createProvider: (data) => ProviderService.create(data),
  updateProvider: (id, data) => ProviderService.update(id, data),
  deleteProvider: (id) => ProviderService.delete(id),
  restoreProvider: (id) => ProviderService.restore(id)
};

export default ProviderService;