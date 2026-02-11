import { apiContracts } from '../../../config/api';

const SchemaService = {
  // Ajustado para aceptar query params (paginación)
  getAllSchemas: async (params = {}) => {
    const response = await apiContracts.get('/schema-management', { params });
    return response.data;
  },

  getSchemaById: async (id) => {
    const response = await apiContracts.get(`/schema-management/${id}`);
    return response.data;
  },

  createSchema: async (schemaData) => {
    const response = await apiContracts.post('/schema-management', schemaData);
    return response.data;
  },

  updateSchema: async (id, schemaData) => {
    const response = await apiContracts.put(`/schema-management/${id}`, schemaData);
    return response.data;
  },

  renameSchema: async (id, newClientKey) => {
    const response = await apiContracts.patch(`/schema-management/${id}/rename`, { new_client_key: newClientKey });
    return response.data;
  },

  validateSchema: async (id) => {
    const response = await apiContracts.post(`/schema-management/${id}/validate`);
    return response.data;
  },

  deleteSchema: async (id) => {
    const response = await apiContracts.delete(`/schema-management/${id}`);
    return response.data;
  }
};

export default SchemaService;