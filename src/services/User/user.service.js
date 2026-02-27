import api from '../../config/api';

const DEFAULT_PASSWORD = "Password2026!";

const UserService = {

  // Listado de usuarios. Permite page/limit y params extra para futuros filtros.
  getAll: async ({ page = 1, limit = 10, ...restParams } = {}) => {
    const params = { page, limit, ...restParams };
    if (import.meta.env.DEV) {
      console.debug("[UserService.getAll] params:", params);
    }
    const response = await api.get("/users", {
      params,
    });
    return response.data;
  },

  getById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  create: async (userData) => {
  const payload = { ...userData };

  if (!payload.password || payload.password.trim() === "") {
    payload.password = DEFAULT_PASSWORD;
  }

  if (payload.entityId) {
    const [type, id] = payload.entityId.split('_');
    if (type === 'c') payload.clientId = id;
    if (type === 'p') payload.providerId = id;
    delete payload.entityId;
  }

  if (!payload.providerId || payload.providerId === "") delete payload.providerId;
  if (!payload.clientId || payload.clientId === "") delete payload.clientId;
  if (!payload.roleId || payload.roleId === "") delete payload.roleId;

  const response = await api.post('/users', payload);
  return response.data;
},

update: async (id, userData) => {
  const payload = { ...userData };
  if (!payload.password || payload.password === "") delete payload.password;

  if (payload.entityId) {
    const [type, orgId] = payload.entityId.split('_');
    if (type === 'c') payload.clientId = orgId;
    if (type === 'p') payload.providerId = orgId;
    delete payload.entityId;
  }

  if (!payload.providerId || payload.providerId === "") delete payload.providerId;
  if (!payload.clientId || payload.clientId === "") delete payload.clientId;

  const response = await api.put(`/users/${id}`, payload);
  return response.data;
},
  
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getAllUsers: () => UserService.getAll(),
  getUserById: (id) => UserService.getById(id),
  createUser: (data) => UserService.create(data),
  updateUser: (id, data) => UserService.update(id, data),
  deleteUser: (id) => UserService.delete(id),
};

export default UserService;