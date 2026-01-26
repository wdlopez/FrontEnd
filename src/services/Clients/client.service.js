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

  createClient: async (userData) => {
    const response = await api.post('/client', userData);
    return response.data;
  },

  updateClient: async (id, userData) => {
    const response = await api.put(`/client/${id}`, userData);
    return response.data;
  },

  deleteClient: async (id) =>{
    const response = await api.delete(`/client/${id}`);
    return response.data;
  }
};

export default ClientService;