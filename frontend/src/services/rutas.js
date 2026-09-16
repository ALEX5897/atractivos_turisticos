import api from '@/services/auth'

export const rutasService = {
  getAll: (params) => api.get('/rutas', { params }),
  getById: (id) => api.get(`/rutas/${id}`),
  getFilterOptions: (params = {}) => api.get('/rutas/filter-options', { params }),
  create: (data) => api.post('/rutas', data),
  update: (id, data) => api.put(`/rutas/${id}`, data),
  remove: (id) => api.delete(`/rutas/${id}`),
}
