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

  // Interceptor de response
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Antes se forzaba logout en cualquier 401, lo que era muy agresivo
      // y podía sacar al usuario al login por errores de cabeceras (x-target-schema, etc.).
      // Ahora solo redirigimos a login si el 401 viene claramente de endpoints de auth.
      if (error.response && error.response.status === 401) {
        const url = error.config?.url || "";
        const isAuthEndpoint =
          url.includes("/auth") ||
          url.includes("/login") ||
          url.includes("/validate/session");

        if (isAuthEndpoint) {
          Cookies.remove("auth_token");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
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