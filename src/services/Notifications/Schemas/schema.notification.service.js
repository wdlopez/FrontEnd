import { apiNotifications } from '../../../config/api';

const SchemaNotificationService = {
  // Ajustado para aceptar query params (paginación)
  getAllSchemas: async (params = {}) => {
    const response = await apiNotifications.get('/schema-management', { params });
    return response.data;
  },

  getSchemaById: async (id) => {
    const response = await apiNotifications.get(`/schema-management/${id}`);
    return response.data;
  },

  createSchema: async (schemaData) => {
    const response = await apiNotifications.post('/schema-management', schemaData);
    return response.data;
  },

  updateSchema: async (id, schemaData) => {
    const response = await apiNotifications.put(`/schema-management/${id}`, schemaData);
    return response.data;
  },

  renameSchema: async (id, newClientKey) => {
    const response = await apiNotifications.patch(`/schema-management/${id}/rename`, { new_client_key: newClientKey });
    return response.data;
  },

  validateSchema: async (id) => {
    const response = await apiNotifications.post(`/schema-management/${id}/validate`);
    return response.data;
  },

  deleteSchema: async (id) => {
    const response = await apiNotifications.delete(`/schema-management/${id}`);
    return response.data;
  }
};

export default SchemaNotificationService;