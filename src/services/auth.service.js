import api from '../config/api';

const AuthService = {
  /**
   * Realiza el login contra el microservicio Contratos-Autenticacion
   * @param {Object} credentials - { user_nickname, user_pss } (Ajustar según tu DTO de backend)
   */
  login: async (credentials) => {
    // IMPORTANTE: Revisa en tu SignInRequestDto del backend si los campos son 
    // user_nickname y user_pss o username y password.
    // Asumiré que mantienes los nombres del frontend anterior, pero adáptalos si el backend cambió.
    const response = await api.post('/auth/signin', credentials); 
    return response.data;
  },

  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  }
};

export default AuthService;