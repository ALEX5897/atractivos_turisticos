import api from '@/services/auth'

export const reportesService = {
  getCampos: () => api.get('/reportes/campos'),

  generarReporte: async (config) => {
    try {
      const response = await api.post('/reportes/generar', config, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte_${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      throw err
    }
  }
}
