import api from '../../config/api';

const UserService = {
  // Obtener todos los usuarios (para la tabla)
  getAllUsers: async () => {
    const response = await api.get('/users/user'); 
    return response.data; // Asumiendo que devuelve { data: [...] } o el array directo
  },

  // Crear usuario (Admin dashboard)
  createUser: async (userData) => {
    const response = await api.post('/users/user', userData);
    return response.data;
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  // Eliminar/Desactivar usuario
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default UserService;