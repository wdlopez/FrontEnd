import { apiDeliverables } from '../../../config/api';

const SchemaDeliverableService = {
  // Ajustado para aceptar query params (paginación)
  getAllSchemas: async (params = {}) => {
    const response = await apiDeliverables.get('/schema-management', { params });
    return response.data;
  },

  getSchemaById: async (id) => {
    const response = await apiDeliverables.get(`/schema-management/${id}`);
    return response.data;
  },

  createSchema: async (schemaData) => {
    const response = await apiDeliverables.post('/schema-management', schemaData);
    return response.data;
  },

  updateSchema: async (id, schemaData) => {
    const response = await apiDeliverables.put(`/schema-management/${id}`, schemaData);
    return response.data;
  },

  renameSchema: async (id, newClientKey) => {
    const response = await apiDeliverables.patch(`/schema-management/${id}/rename`, { new_client_key: newClientKey });
    return response.data;
  },

  validateSchema: async (id) => {
    const response = await apiDeliverables.post(`/schema-management/${id}/validate`);
    return response.data;
  },

  deleteSchema: async (id) => {
    const response = await apiDeliverables.delete(`/schema-management/${id}`);
    return response.data;
  }
};

export default SchemaDeliverableService;