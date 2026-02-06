import { apiContracts } from "../../../config/api";

const ClauseService = {
    getAllClauses: async () => {
        const response = await apiContracts.get('/clause');
        return response.data;
    },

    getClauseById: async (id) =>{
        const response = await apiContracts.get(`/clause/${id}`);
        return response.data;
    },

    createClause: async (clauseData) =>{
        const response = await apiContracts.post('/clause', clauseData);
        return response.data;
    },

    updateClause: async (id, clauseData) =>{
        const response = await apiContracts.put(`/clause/${id}`, clauseData);
        return response.data;
    },
    
    deleteClause: async (id) =>{
        const response = await apiContracts.delete(`/clause/${id}`);
        return response.data;
    }
};

export default ClauseService;