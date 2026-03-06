import { apiContracts } from '../../config/api';

const ContractService = {
  getAll: async (params = {}) => {
    if (import.meta.env.DEV) {
      console.debug("[ContractService.getAll] params:", params);
    }
    const response = await apiContracts.get("/contracts", { params });
    return response.data;
  },

  // Contratos eliminados (soft-delete)
  getAllDeleted: async (params = {}) => {
    if (import.meta.env.DEV) {
      console.debug("[ContractService.getAllDeleted] params:", params);
    }
    const response = await apiContracts.get("/contracts/deleted", { params });
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

  restore: async (id) => {
    const response = await apiContracts.patch(`/contracts/${id}/restore`);
    return response.data;
  },

  getAllContracts: () => ContractService.getAll(),
  getAllDeletedContracts: () => ContractService.getAllDeleted(),
  getContractById: (id) => ContractService.getById(id),
  createContract: (data) => ContractService.create(data),
  updateContract: (id, data) => ContractService.update(id, data),
  deleteContract: (id) => ContractService.delete(id),
  restoreContract: (id) => ContractService.restore(id),
};

export default ContractService;