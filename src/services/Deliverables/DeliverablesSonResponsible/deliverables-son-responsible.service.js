import { apiDeliverables } from '../../../config/api';

const DeliverableSonResponsibleService = {
  getAllDeliverablesSonResponsible: async () => {
    const response = await apiDeliverables.get('/deliverable-son-responsible');
    return response.data; 
  },

  getDeliverableSonResponsibleById: async (deliverableSonResponsibleId) => {
    const response = await apiDeliverables.get(`/deliverable-son-responsible/${deliverableSonResponsibleId}`);
    return response.data;
  },

  createDeliverableSonResponsible: async (deliverableSonResponsibleData) =>{
    const response = await apiDeliverables.post('/deliverable-son-responsible', deliverableSonResponsibleData);
    return response.data;
  },

  updateDeliverableSonResponsible: async (id, deliverableSonResponsibleData) => {
    const response = await apiDeliverables.put(`/deliverable-son-responsible/${id}`, deliverableSonResponsibleData);
    return response.data;
  },

  
  deleteDeliverableSonResponsible: async (id) => {
    const response = await apiDeliverables.delete(`/deliverable-son-responsible/${id}`);
    return response.data;
  },
};

export default DeliverableSonResponsibleService;