// src/services/Clients/client.service.js
import api from '../../config/api';

const ClientService = {
 
  getAllClients: async (params = {}) => {
    const response = await api.get('/client', { params });
    return response.data; 
  },

  getClientById: async (id) => {
    const response = await api.get(`/client/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await api.post('/client', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await api.put(`/client/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) =>{
    const response = await api.delete(`/client/${id}`);
    return response.data;
  }
};

export default ClientService;