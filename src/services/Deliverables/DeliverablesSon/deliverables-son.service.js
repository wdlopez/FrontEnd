import { apiDeliverables } from '../../../config/api';

const DeliverableSonService = {
  getAllDeliverablesSon: async () => {
    const response = await apiDeliverables.get('/deliverable-son');
    return response.data; 
  },

  getDeliverableSonById: async (deliverableSonId) => {
    const response = await apiDeliverables.get(`/deliverable-son/${deliverableSonId}`);
    return response.data;
  },

  createDeliverableSon: async (deliverableSonData) =>{
    const response = await apiDeliverables.post('/deliverable-son', deliverableSonData);
    return response.data;
  },

  updateDeliverableSon: async (id, deliverableSonData) => {
    const response = await apiDeliverables.put(`/deliverable-son/${id}`, deliverableSonData);
    return response.data;
  },

  
  deleteDeliverableSon: async (id) => {
    const response = await apiDeliverables.delete(`/deliverable-son/${id}`);
    return response.data;
  },
};

export default DeliverableSonService;