import api from '../../config/api';

const AuthService = {
  /**
   * Realiza el login contra el microservicio Contratos-Autenticacion
   * @param {Object} credentials
   */

  //Crud para iniciar sesion
  login: async (credentials) => {
    const response = await api.post('/auth/signin', credentials); 
    return response.data.data;
  },
  /**
   * Crud para registra un nuevo usuario
   * @param {Object} userData
   */
  register: async (userData) => {
    const response = await api.post('/auth/signup', userData); 
    return response.data;
  },

  /**
   * Crud para solicitar cambio de contraseña
   * @param {Object} data
   */
  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  }
};

export default AuthService;