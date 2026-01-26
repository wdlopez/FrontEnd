import { apiProviders } from '../../config/api';

const ProviderService = {
  getAllProviders: async () => {
    const response = await apiProviders.get('/providers');
    return response.data; 
  },

  getProviderById: async (providerId) => {
    const response = await apiProviders.get(`/providers/${providerId}`);
    return response.data;
  },

  createProvider: async (providerData) =>{
    const response = await apiProviders.post('/providers', providerData);
    return response.data;
  },

  updateProvider: async (id, providerData) => {
    const response = await apiProviders.put(`/providers/${id}`, providerData);
    return response.data;
  },

  
  deleteProvider: async (id) => {
    const response = await apiProviders.delete(`/providers/${id}`);
    return response.data;
  },

  restoreProvider: async (id) => {
    const response = await apiProviders.patch(`/providers/${id}/restore`);
    return response.data;
  }
};

export default ProviderService;