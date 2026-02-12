import { apiDeliverables } from '../../config/api';

const DeliverableService = {
  getAllDeliverables: async () => {
    const response = await apiDeliverables.get('/deliverable');
    return response.data; 
  },

  getDeliverableById: async (providerId) => {
    const response = await apiDeliverables.get(`/deliverable/${providerId}`);
    return response.data;
  },

  createDeliverable: async (providerData) =>{
    const response = await apiDeliverables.post('/deliverable', providerData);
    return response.data;
  },

  updateDeliverable: async (id, providerData) => {
    const response = await apiDeliverables.put(`/deliverable/${id}`, providerData);
    return response.data;
  },

  
  deleteDeliverable: async (id) => {
    const response = await apiDeliverables.delete(`/deliverable/${id}`);
    return response.data;
  },
};

export default DeliverableService;