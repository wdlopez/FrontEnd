import { apiContracts } from '../../../config/api';

const ClauseService = {
  getAll: async (params = {}) => {
    const response = await apiContracts.get('/clause', { params });
    return response.data; 
  },

  getAllDeleted: async (params = {}) => {
    const response = await apiContracts.get('/clause/deleted', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiContracts.get(`/clause/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiContracts.post('/clause', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiContracts.put(`/clause/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiContracts.delete(`/clause/${id}`);
    return response.data;
  },

  restore: async (id) => {
    const response = await apiContracts.patch(`/clause/${id}/restore`);
    return response.data;
  },

  getAllClauses: (params) => ClauseService.getAll(params),
  getAllDeletedClauses: (params) => ClauseService.getAllDeleted(params),
  getClauseById: (id) => ClauseService.getById(id),
  createClause: (data) => ClauseService.create(data),
  updateClause: (id, data) => ClauseService.update(id, data),
  deleteClause: (id) => ClauseService.delete(id),
  restoreClause: (id) => ClauseService.restore(id),
};

export default ClauseService;