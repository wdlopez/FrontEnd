import { apiSLAs } from '../../../config/api';

const MeasurementWindowService = {
  getAllWindows: async () => {
    const response = await apiSLAs.get('/measurement-window');
    return response.data; 
  },

  getWindowById: async (windowId) => {
    const response = await apiSLAs.get(`/measurement-window/${windowId}`);
    return response.data;
  },

  createWindow: async (windowData) =>{
    const response = await apiSLAs.post('/measurement-window', windowData);
    return response.data;
  },

  updateWindow: async (id, windowData) => {
    const response = await apiSLAs.put(`/measurement-window/${id}`, windowData);
    return response.data;
  },

  
  deleteWindow: async (id) => {
    const response = await apiSLAs.delete(`/measurement-window/${id}`);
    return response.data;
  },
};

export default MeasurementWindowService;