import api from '@/services/auth'

export const catalogosAdminService = {
  getTables: () => api.get('/catalogos-admin/tables'),
  getAll: (tableKey, params) => api.get(`/catalogos-admin/${tableKey}`, { params }),
  create: (tableKey, payload) => api.post(`/catalogos-admin/${tableKey}`, payload),
  update: (tableKey, id, payload) => api.put(`/catalogos-admin/${tableKey}/${id}`, payload),
  remove: (tableKey, id) => api.delete(`/catalogos-admin/${tableKey}/${id}`),
}
