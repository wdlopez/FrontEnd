import api from '../../config/api';

const RoleService = {
  getRoles: async () => {
    const response = await api.get('/roles');
    return response.data; 
  }
};

export default RoleService;