import axios from 'axios';
import Cookies from 'js-cookie';

// Función para crear un interceptor genérico
const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Interceptor de request
  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de response
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        Cookies.remove('auth_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// API para usuarios, clientes, roles (microservicio principal)
const api = createApiInstance(import.meta.env.VITE_API_URL);

// API para proveedores (microservicio de proveedores)
const apiProviders = createApiInstance(import.meta.env.VITE_API_URL_PROVIDERS);
// API para contratos (microservicio de contratos)
const apiContracts = createApiInstance(import.meta.env.VITE_API_URL_CONTRACTS)
// API para deliverables (microservicio de deliverables)
const apiDeliverables = createApiInstance(import.meta.env.VITE_API_URL_DELIVERABLES)
// API para SLAs (microservicio de SLAs)
const apiSLAs = createApiInstance(import.meta.env.VITE_API_URL_SLAS)
// API para facturasd (microservicio de facturas)
const apiInvoices = createApiInstance(import.meta.env.VITE_API_URL_INVOICES)
// API para notificaciones (microservicio de notificaciones)
const apiNotifications = createApiInstance(import.meta.env.VITE_API_URL_NOTIFICATIONS)

export default api;
export { apiProviders, apiContracts, apiDeliverables, apiSLAs, apiInvoices, apiNotifications };