import api from '@/services/auth'

export const catalogosService = {
  getCategorias: () => api.get('/catalogos/categorias'),
  getTipos: (id_categoria) =>
    api.get('/catalogos/tipos', { params: id_categoria ? { id_categoria } : {} }),
  getParroquias: () => api.get('/catalogos/parroquias'),
  getAdministracionesZonales: () => api.get('/catalogos/administraciones-zonales'),
  getTiposExperiencia: () => api.get('/catalogos/tipos-experiencia'),
  getTiposRuta: () => api.get('/catalogos/tipos-ruta'),
  getAtractivosActivos: () => api.get('/catalogos/atractivos-activos'),
  getNodos: () => api.get('/catalogos/nodos'),
  getCentralidades: () => api.get('/catalogos/centralidades'),
  getModalidades: () => api.get('/catalogos/modalidades'),
  getSubcentralidades: () => api.get('/catalogos/subcentralidades'),
}
