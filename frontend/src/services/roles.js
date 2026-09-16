import api from './auth'

export const rolesService = {
  getAll: (params) => api.get('/roles', { params }),
  getById: (id) => api.get(`/roles/${id}`),
  getAllPermisos: () => api.get('/roles/all/permisos'),
  getPermisosDelRol: (id) => api.get(`/roles/${id}/permisos`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  remove: (id) => api.delete(`/roles/${id}`),
  assignPermisos: (id, permisos) => api.post(`/roles/${id}/permisos`, { permisos }),
}
