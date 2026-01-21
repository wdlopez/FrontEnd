import api from '../../config/api';

const ClientService = {
  getRoles: async () => {
    const response = await api.get('/client');
    return response.data; 
  }
};

export default ClientService;