import { apiProviders } from '../../../config/api';

const ProviderRiskService = {
  getAllProvidersRisk: async () => {
    const response = await apiProviders.get('/provider-risk');
    return response.data; 
  },

  getProviderRiskById: async (providerRiskId) => {
    const response = await apiProviders.get(`/provider-risk/${providerRiskId}`);
    return response.data;
  },

  createProviderRisk: async (providerRiskData) =>{
    const response = await apiProviders.post('/provider-risk', providerRiskData);
    return response.data;
  },

  updateProviderRisk: async (id, providerRiskData) => {
    const response = await apiProviders.put(`/provider-risk/${id}`, providerRiskData);
    return response.data;
  },

  deleteProviderRisk: async (id) => {
    const response = await apiProviders.delete(`/provider-risk/${id}`);
    return response.data;
  }
};

export default ProviderRiskService;