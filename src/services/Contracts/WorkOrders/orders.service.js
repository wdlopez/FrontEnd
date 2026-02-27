import { apiContracts } from '../../../config/api';

const WorkOrderService = {
    // Permite pasar filtros (por ejemplo clientId) sin romper los usos actuales
    getAllOrders: async (params = {}) => {
        const response = await apiContracts.get('/work-order', { params });
        return response.data;
    },

    getOrderById: async (id) =>{
        const response = await apiContracts.get(`/work-order/${id}`);
        return response.data;
    },

    createOrder: async (orderData) =>{
        const response = await apiContracts.post('/work-order', orderData);
        return response.data;
    },

    updateOrder: async (id, orderData) =>{
        const response = await apiContracts.put(`/work-order/${id}`, orderData);
        return response.data;
    },

    deleteOrder: async (id) =>{
        const response = await apiContracts.delete(`/work-order/${id}`);
        return response.data;
    }
};

export default WorkOrderService;