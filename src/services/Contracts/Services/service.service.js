import { apiContracts } from '../../../config/api';

const ServiceService = {
    getAllServices: async () => {
        const response = await apiContracts.get('/service-contract');
        return response.data;
    },

    getServiceById: async (id) =>{
        const response = await apiContracts.get(`/service-contract/${id}`);
        return response.data;
    },

    createService: async (serviceData) =>{
        const response = await apiContracts.post('/service-contract', serviceData);
        return response.data;
    },

    updateService: async (id, serviceData) =>{
        const response = await apiContracts.put(`/service-contract/${id}`, serviceData);
        return response.data;
    },

    deleteService: async (id) =>{
        const response = await apiContracts.delete(`/service-contract/${id}`);
        return response.data;
    }
};

export default ServiceService;