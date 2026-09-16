import api from '@/services/auth'

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
}
