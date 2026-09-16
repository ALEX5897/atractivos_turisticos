import api from '@/services/auth'

export const experienciasService = {
  getAll: (params) => api.get('/experiencias', { params }),
  getById: (id) => api.get(`/experiencias/${id}`),
  getFilterOptions: (params = {}) => api.get('/experiencias/filter-options', { params }),
  create: (data) => api.post('/experiencias', data),
  update: (id, data) => api.put(`/experiencias/${id}`, data),
  remove: (id) => api.delete(`/experiencias/${id}`),
}
