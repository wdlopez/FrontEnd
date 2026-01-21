import api from '../../config/api';

const ProviderService = {
  getRoles: async () => {
    const response = await api.get('/provider');
    return response.data; 
  }
};

export default ProviderService;