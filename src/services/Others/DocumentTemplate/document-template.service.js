import { apiNotifications } from '../../../config/api';

const DocumentTemplateService = {
  getAllDocuments: async () => {
    const response = await apiNotifications.get('/document-template');
    return response.data; 
  },

  getDocumentById: async (documentId) => {
    const response = await apiNotifications.get(`/document-template/${documentId}`);
    return response.data;
  },

  createDocument: async (documentData) =>{
    const response = await apiNotifications.post('/document-template', documentData);
    return response.data;
  },

  updateDocument: async (id, documentData) => {
    const response = await apiNotifications.put(`/document-template/${id}`, documentData);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await apiNotifications.delete(`/document-template/${id}`);
    return response.data;
  },
};

export default DocumentTemplateService;