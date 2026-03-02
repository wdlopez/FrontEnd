import api from '../../config/api';
import axios from 'axios';

const AuthService = {
  /**
   * Realiza el login contra el microservicio Contratos-Autenticacion
   * @param {Object} credentials
   */

  //Crud para iniciar sesion
  login: async (credentials) => {
    const response = await api.post('/auth/signin', credentials); 
    return response.data;
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
  },

  resetPassword: async (data) =>{
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Solicita nuevos tokens usando el refresh token.
   * Este endpoint es público y no debe depender del access token actual.
   * @param {string} refreshToken
   */
  refreshToken: async (refreshToken) => {
    const baseURL = import.meta.env.VITE_API_URL;
    const response = await axios.post(
      `${baseURL}/auth/refresh-token`,
      { refreshToken },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },
};

export default AuthService;