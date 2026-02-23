import api from '../../config/api';

const UserClientService = {
    
  create: async (data) => {
    const response = await api.post('/user-clients', data);
    return response.data;
  }
};

export default UserClientService;