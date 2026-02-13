import { apiInvoices } from '../../config/api';

const InvoiceService = {
  getAllInvoices: async () => {
    const response = await apiInvoices.get('/Invoice');
    return response.data; 
  },

  getInvoiceById: async (invoiceId) => {
    const response = await apiInvoices.get(`/Invoice/${invoiceId}`);
    return response.data;
  },

  createInvoice: async (invoiceData) =>{
    const response = await apiInvoices.post('/Invoice', invoiceData);
    return response.data;
  },

  updateInvoice: async (id, invoiceData) => {
    const response = await apiInvoices.put(`/Invoice/${id}`, invoiceData);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await apiInvoices.delete(`/Invoice/${id}`);
    return response.data;
  },
};

export default InvoiceService;