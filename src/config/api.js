import axios from 'axios';
import Cookies from 'js-cookie';
import AuthService from '../services/auth/auth.service';
import { notifyTokensUpdated } from '../context/authTokensBridge';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const logoutAndRedirect = () => {
  Cookies.remove('auth_token');
  Cookies.remove('refresh_token');
  Cookies.remove('user_data');
  try {
    window.localStorage?.removeItem('selected_schema');
    // Marcamos en localStorage que la sesión expiró para poder mostrar un mensaje en login si se desea
    window.localStorage?.setItem('session_expired', '1');
  } catch {
    // Ignoramos errores de acceso a localStorage
  }
  if (!window.location.pathname.startsWith('/login')) {
    // Redirigimos con un parámetro que indique claramente que la sesión expiró
    window.location.href = '/login?reason=session_expired';
  }
};

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

      // Si el usuario es super_admin y hay un esquema seleccionado,
      // añadimos automáticamente el header x-target-schema.
      try {
        const rawUser = Cookies.get('user_data');
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          const isSuperAdmin =
            parsed?.role === 'super_admin' ||
            parsed?.role === 1 ||
            parsed?.role === '1';
          if (isSuperAdmin) {
            const selectedSchema =
              window.localStorage?.getItem('selected_schema') || null;
            if (selectedSchema) {
              config.headers['x-target-schema'] = selectedSchema;
            }
          }
        }
      } catch (e) {
        // En caso de error al leer user_data, no rompemos la petición.
        // console.error("Error leyendo user_data para x-target-schema:", e);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de response con lógica de refresh token y cola de peticiones
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (!error.response) {
        return Promise.reject(error);
      }

      const status = error.response.status;
      if (status !== 401) {
        return Promise.reject(error);
      }

      const url = originalRequest?.url || '';

      const isAuthPublicEndpoint =
        url.includes('/auth/signin') ||
        url.includes('/auth/signup') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password');

      const isRefreshEndpoint = url.includes('/auth/refresh-token');

      // Para endpoints de autenticación públicos no intentamos refrescar
      if (isAuthPublicEndpoint) {
        return Promise.reject(error);
      }

      // Si el error viene del propio refresh-token o ya se reintentó, forzamos logout
      if (isRefreshEndpoint || originalRequest._retry) {
        logoutAndRedirect();
        return Promise.reject(error);
      }

      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        logoutAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers = originalRequest.headers || {};
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await AuthService.refreshToken(refreshToken);
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (!newAccessToken) {
          throw new Error('No se recibió accessToken en la respuesta de refresh-token');
        }

        const cookieOptions = {
          expires: 1,
          secure: true,
          sameSite: 'strict',
        };

        Cookies.set('auth_token', newAccessToken, cookieOptions);
        if (newRefreshToken) {
          Cookies.set('refresh_token', newRefreshToken, cookieOptions);
        }

        notifyTokensUpdated(newAccessToken, newRefreshToken);

        isRefreshing = false;
        processQueue(null, newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        logoutAndRedirect();
        return Promise.reject(refreshError);
      }
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