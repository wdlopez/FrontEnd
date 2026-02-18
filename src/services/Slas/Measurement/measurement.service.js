import { apiSLAs } from '../../../config/api';

const MeasurementService = {
  getAllMeasurements: async () => {
    const response = await apiSLAs.get('/sla-measurement');
    return response.data; 
  },

  getMeasurementById: async (measurementId) => {
    const response = await apiSLAs.get(`/sla-measurement/${measurementId}`);
    return response.data;
  },

  createMeasurement: async (measurementData) =>{
    const response = await apiSLAs.post('/sla-measurement', measurementData);
    return response.data;
  },

  updateMeasurement: async (id, measurementData) => {
    const response = await apiSLAs.put(`/sla-measurement/${id}`, measurementData);
    return response.data;
  },

  deleteMeasurement: async (id) => {
    const response = await apiSLAs.delete(`/sla-measurement/${id}`);
    return response.data;
  },
};

export default MeasurementService;