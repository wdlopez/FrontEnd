import api from '../../config/api';

const UserService = {
  // Obtener todos los usuarios (para la tabla)
  getAllUsers: async () => {
    const response = await api.get('/users/user'); 
    return response.data;
  },

  // Obtener un usuario específico por ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/user/${userId}`);
    return response.data;
  },

  // Crear usuario (Admin dashboard)
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Eliminar/Desactivar usuario
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default UserService;