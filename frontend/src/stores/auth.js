import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // Estado reactivo
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters computados
  const isAuthenticated = computed(() => user.value !== null)
  const userName = computed(() => user.value?.name || user.value?.username || '')
  const userEmail = computed(() => user.value?.email || '')
  const userRoles = computed(() => user.value?.roles || [])
  const userPermisos = computed(() => user.value?.permisos || [])

  function hasRole(role) {
    return userRoles.value.includes(role)
  }

  function hasPermission(codigo) {
    return userPermisos.value && Array.isArray(userPermisos.value) && userPermisos.value.includes(codigo)
  }

  async function login(username, password) {
    loading.value = true
    error.value = null

    try {
      await authService.login(username, password)
      await fetchUser()
      await router.push({ name: 'index' })
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión'
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await authService.logout()
    } catch {
      // Limpia localmente aunque el servidor falle
    } finally {
      user.value = null
      loading.value = false
      await router.push({ name: 'login' })
    }
  }

  async function fetchUser() {
    try {
      const { data } = await authService.getMe()
      user.value = data.user
    } catch {
      user.value = null
    }
  }

  // Verifica sesión al montar la aplicación
  async function checkSession() {
    try {
      await fetchUser()
    } catch {
      user.value = null
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userName,
    userEmail,
    userRoles,
    userPermisos,
    hasRole,
    hasPermission,
    login,
    logout,
    fetchUser,
    checkSession,
  }
})
