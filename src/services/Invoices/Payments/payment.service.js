import { apiInvoices } from '../../../config/api';

const PaymentService = {
  getAllPayments: async () => {
    const response = await apiInvoices.get('/Payment');
    return response.data; 
  },

  getPaymentById: async (paymentId) => {
    const response = await apiInvoices.get(`/Payment/${paymentId}`);
    return response.data;
  },

  createPayment: async (paymentData) =>{
    const response = await apiInvoices.post('/Payment', paymentData);
    return response.data;
  },

  updatePayment: async (id, paymentData) => {
    const response = await apiInvoices.put(`/Payment/${id}`, paymentData);
    return response.data;
  },

  deletePayment: async (id) => {
    const response = await apiInvoices.delete(`/Payment/${id}`);
    return response.data;
  },
};

export default PaymentService;