import { apiContracts } from '../../config/api';

const ContractService = {
    getAllContracts: async (params = {}) =>{
        const response = await apiContracts.get('/contracts', { params });
        return response.data;
    },

    getContractById: async (id) =>{
        const response = await apiContracts.get(`/contracts/${id}`);
        return response.data;
    },

    createContract: async (contractData) =>{
        const response = await apiContracts.post('/contracts', contractData);
        return response.data;
    },

    updateContract: async (id, contractData) =>{
        const response = await apiContracts.put(`/contracts/${id}`, contractData);
        return response.data;
    },

    deleteContract: async (id) =>{
        const response = await apiContracts.delete(`/contracts/${id}`);
        return response.data;
    }
};

export default ContractService;