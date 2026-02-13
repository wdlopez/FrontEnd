import { apiSLAs } from '../../config/api';

const SlasService = {
  getAllSlas: async () => {
    const response = await apiSLAs.get('/sla');
    return response.data; 
  },

  getSlasById: async (providerId) => {
    const response = await apiSLAs.get(`/sla/${providerId}`);
    return response.data;
  },

  createSlas: async (providerData) =>{
    const response = await apiSLAs.post('/sla', providerData);
    return response.data;
  },

  updateSlas: async (id, providerData) => {
    const response = await apiSLAs.put(`/sla/${id}`, providerData);
    return response.data;
  },

  
  deleteSlas: async (id) => {
    const response = await apiSLAs.delete(`/sla/${id}`);
    return response.data;
  },
};

export default SlasService;