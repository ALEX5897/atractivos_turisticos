import api from './auth'

export const auditoriaService = {
  getAll: (params) => api.get('/auditoria', { params }),
  getByTabla: (tabla, params) => api.get(`/auditoria/tabla/${tabla}`, { params }),
  getByRegistro: (tabla, id) => api.get(`/auditoria/registro/${tabla}/${id}`),
  getByUsuario: (usuario_id, params) => api.get(`/auditoria/usuario/${usuario_id}`, { params }),
}
