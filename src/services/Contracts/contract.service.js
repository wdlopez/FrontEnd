import { apiContracts } from '../../config/api';

const ContractService = {
  getAll: async (params = {}) => {
    if (import.meta.env.DEV) {
      console.debug("[ContractService.getAll] params:", params);
    }
    const response = await apiContracts.get("/contracts", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiContracts.get(`/contracts/${id}`);
    return response.data;
  },

  create: async (contractData) => {
    const response = await apiContracts.post("/contracts", contractData);
    return response.data;
  },

  update: async (id, contractData) => {
    const response = await apiContracts.put(`/contracts/${id}`, contractData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiContracts.delete(`/contracts/${id}`);
    return response.data;
  },

  getAllContracts: () => ContractService.getAll(),
  getContractById: (id) => ContractService.getById(id),
  createContract: (data) => ContractService.create(data),
  updateContract: (id, data) => ContractService.update(id, data),
  deleteContract: (id) => ContractService.delete(id),
};

export default ContractService;