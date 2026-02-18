import { apiSLAs } from '../../../config/api';

const SlasCreditService = {
  getAllCredits: async () => {
    const response = await apiSLAs.get('/sla-credit');
    return response.data; 
  },

  getCreditById: async (creditId) => {
    const response = await apiSLAs.get(`/sla-credit/${creditId}`);
    return response.data;
  },

  createCredit: async (creditData) =>{
    const response = await apiSLAs.post('/sla-credit', creditData);
    return response.data;
  },

  updateCredit: async (id, creditData) => {
    const response = await apiSLAs.put(`/sla-credit/${id}`, creditData);
    return response.data;
  },

  deleteCredit: async (id) => {
    const response = await apiSLAs.delete(`/sla-credit/${id}`);
    return response.data;
  },
};

export default SlasCreditService;