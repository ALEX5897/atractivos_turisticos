import api from '@/services/auth'

export const atractivosService = {
  getAll: (params) => api.get('/atractivos', { params }),
  getById: (id) => api.get(`/atractivos/${id}`),
  getFilterOptions: (params = {}) => api.get('/atractivos/filter-options', { params }),
  create: (data) => api.post('/atractivos', data),
  update: (id, data) => api.put(`/atractivos/${id}`, data),
  remove: (id) => api.delete(`/atractivos/${id}`),
}
