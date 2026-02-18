import { apiProviders } from '../../../config/api';

const ProviderContactService = {
  getAllProviders: async () => {
    const response = await apiProviders.get('/provider-contact');
    return response.data; 
  },

  getProviderContactById: async (providerContactId) => {
    const response = await apiProviders.get(`/provider-contact/${providerContactId}`);
    return response.data;
  },

  createProviderContact: async (providerContactData) =>{
    const response = await apiProviders.post('/provider-contact', providerContactData);
    return response.data;
  },

  updateProviderContact: async (id, providerContactData) => {
    const response = await apiProviders.put(`/provider-contact/${id}`, providerContactData);
    return response.data;
  },

  deleteProviderContact: async (id) => {
    const response = await apiProviders.delete(`/provider-contact/${id}`);
    return response.data;
  }
};

export default ProviderContactService;