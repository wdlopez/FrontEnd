import { apiInvoices } from '../../../config/api';

const ItemInvoiceService = {
  getAllItemsInvoice: async () => {
    const response = await apiInvoices.get('/invoice-item');
    return response.data; 
  },

  getItemInvoiceById: async (itemInvoiceId) => {
    const response = await apiInvoices.get(`/invoice-item/${itemInvoiceId}`);
    return response.data;
  },

  createItemInvoice: async (itemInvoiceData) =>{
    const response = await apiInvoices.post('/invoice-item', itemInvoiceData);
    return response.data;
  },

  updateItemInvoice: async (id, itemInvoiceData) => {
    const response = await apiInvoices.put(`/invoice-item/${id}`, itemInvoiceData);
    return response.data;
  },

  deleteItemInvoice: async (id) => {
    const response = await apiInvoices.delete(`/invoice-item/${id}`);
    return response.data;
  },
};

export default ItemInvoiceService;