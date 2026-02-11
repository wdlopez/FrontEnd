import { apiProviders } from '../../../config/api';

const SchemaProviderService = {
  // Ajustado para aceptar query params (paginación)
  getAllSchemas: async (params = {}) => {
    const response = await apiProviders.get('/schema-management', { params });
    return response.data;
  },

  getSchemaById: async (id) => {
    const response = await apiProviders.get(`/schema-management/${id}`);
    return response.data;
  },

  createSchema: async (schemaData) => {
    const response = await apiProviders.post('/schema-management', schemaData);
    return response.data;
  },

  updateSchema: async (id, schemaData) => {
    const response = await apiProviders.put(`/schema-management/${id}`, schemaData);
    return response.data;
  },

  renameSchema: async (id, newClientKey) => {
    const response = await apiProviders.patch(`/schema-management/${id}/rename`, { new_client_key: newClientKey });
    return response.data;
  },

  validateSchema: async (id) => {
    const response = await apiProviders.post(`/schema-management/${id}/validate`);
    return response.data;
  },

  deleteSchema: async (id) => {
    const response = await apiProviders.delete(`/schema-management/${id}`);
    return response.data;
  }
};

export default SchemaProviderService;