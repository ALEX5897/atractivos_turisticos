import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Envía/recibe cookies httpOnly
})

// Interceptor: si el access_token expiró (401), intenta renovarlo automáticamente
let isRefreshing = false
let pendingRequests = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url || ''
    const isRefreshRequest = requestUrl.includes('/auth/refresh')
    const isLoginRequest = requestUrl.includes('/auth/login')

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isLoginRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject })
        }).then(() => api(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')
        pendingRequests.forEach(({ resolve }) => resolve())
        pendingRequests = []
        return api(originalRequest)
      } catch {
        pendingRequests.forEach(({ reject }) => reject())
        pendingRequests = []
        // Redirige al login si el refresh también falla
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const authService = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  refresh: () => api.post('/auth/refresh'),
}

export default api
