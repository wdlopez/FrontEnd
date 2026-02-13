import { apiDeliverables } from '../../config/api';

const DeliverableService = {
  getAllDeliverables: async () => {
    const response = await apiDeliverables.get('/deliverable');
    return response.data; 
  },

  getDeliverableById: async (deliverableId) => {
    const response = await apiDeliverables.get(`/deliverable/${deliverableId}`);
    return response.data;
  },

  createDeliverable: async (deliverableData) =>{
    const response = await apiDeliverables.post('/deliverable', deliverableData);
    return response.data;
  },

  updateDeliverable: async (id, deliverableData) => {
    const response = await apiDeliverables.put(`/deliverable/${id}`, deliverableData);
    return response.data;
  },

  
  deleteDeliverable: async (id) => {
    const response = await apiDeliverables.delete(`/deliverable/${id}`);
    return response.data;
  },
};

export default DeliverableService;