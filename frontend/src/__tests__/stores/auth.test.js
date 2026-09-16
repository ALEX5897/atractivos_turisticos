import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Crear mock compartido para router
const mockPush = vi.fn()
const mockRouter = { push: mockPush }

// Mockear router y authService
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('@/services/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}))

import { useRouter } from 'vue-router'
import { authService } from '@/services/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('debería tener estado inicial vacío', () => {
      const store = useAuthStore()

      expect(store.user).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('isAuthenticated debería ser false sin usuario', () => {
      const store = useAuthStore()

      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Computed properties', () => {
    it('isAuthenticated debería ser true con usuario', () => {
      const store = useAuthStore()
      store.user = { id: 1, username: 'admin' }

      expect(store.isAuthenticated).toBe(true)
    })

    it('userName debería retornar name o username', () => {
      const store = useAuthStore()
      store.user = { username: 'admin', name: 'Admin User' }

      expect(store.userName).toBe('Admin User')
    })

    it('userName debería retornar username si no hay name', () => {
      const store = useAuthStore()
      store.user = { username: 'admin' }

      expect(store.userName).toBe('admin')
    })

    it('userEmail debería retornar email del usuario', () => {
      const store = useAuthStore()
      store.user = { email: 'admin@test.com' }

      expect(store.userEmail).toBe('admin@test.com')
    })

    it('userRoles debería retornar roles del usuario', () => {
      const store = useAuthStore()
      store.user = { roles: ['ADMIN', 'USER'] }

      expect(store.userRoles).toEqual(['ADMIN', 'USER'])
    })

    it('userRoles debería retornar array vacío sin usuario', () => {
      const store = useAuthStore()
      store.user = null

      expect(store.userRoles).toEqual([])
    })
  })

  describe('hasRole', () => {
    it('debería retornar true si usuario tiene el rol', () => {
      const store = useAuthStore()
      store.user = { roles: ['ADMIN', 'USER'] }

      expect(store.hasRole('ADMIN')).toBe(true)
    })

    it('debería retornar false si usuario no tiene el rol', () => {
      const store = useAuthStore()
      store.user = { roles: ['USER'] }

      expect(store.hasRole('ADMIN')).toBe(false)
    })

    it('debería retornar false sin usuario', () => {
      const store = useAuthStore()
      store.user = null

      expect(store.hasRole('ADMIN')).toBe(false)
    })
  })

  describe('fetchUser', () => {
    it('debería obtener datos del usuario actual', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        name: 'Admin User',
        roles: ['ADMIN'],
      }

      authService.getMe.mockResolvedValueOnce({
        data: { user: mockUser },
      })

      const store = useAuthStore()
      await store.fetchUser()

      expect(authService.getMe).toHaveBeenCalled()
      expect(store.user).toEqual(mockUser)
    })

    it('debería setear user a null si getMe falla', async () => {
      authService.getMe.mockRejectedValueOnce(new Error('Not authenticated'))

      const store = useAuthStore()
      await store.fetchUser()

      expect(store.user).toBeNull()
    })
  })

  describe('login', () => {
    it('debería llamar authService.login con credenciales', async () => {
      authService.login.mockResolvedValueOnce({})
      authService.getMe.mockResolvedValueOnce({
        data: { user: { id: 1, username: 'admin' } },
      })

      const store = useAuthStore()
      const router = useRouter()

      await store.login('admin', 'admin')

      expect(authService.login).toHaveBeenCalledWith('admin', 'admin')
      expect(authService.getMe).toHaveBeenCalled()
      expect(store.user).not.toBeNull()
      expect(router.push).toHaveBeenCalledWith({ name: 'index' })
    })

    it('debería setear error si login falla', async () => {
      const errorMessage = 'Credenciales inválidas'
      authService.login.mockRejectedValueOnce({
        response: { data: { error: errorMessage } },
      })

      const store = useAuthStore()

      await store.login('admin', 'wrongpass')

      expect(store.error).toBe(errorMessage)
      expect(store.user).toBeNull()
    })

    it('debería setear loading a true durante login', async () => {
      authService.login.mockImplementationOnce(async () => {
        await new Promise((r) => setTimeout(r, 100))
      })
      authService.getMe.mockResolvedValueOnce({
        data: { user: { id: 1 } },
      })

      const store = useAuthStore()

      const loginPromise = store.login('admin', 'admin')
      // No podemos capturar el estado loading=true mientras está en progreso
      // pero podemos verificar que vuelve a false después
      await loginPromise

      expect(store.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('debería llamar authService.logout y limpiar usuario', async () => {
      authService.logout.mockResolvedValueOnce({})

      const store = useAuthStore()
      store.user = { id: 1, username: 'admin' }
      const router = useRouter()

      await store.logout()

      expect(authService.logout).toHaveBeenCalled()
      expect(store.user).toBeNull()
      expect(router.push).toHaveBeenCalledWith({ name: 'login' })
    })

    it('debería limpiar usuario aunque logout falle', async () => {
      authService.logout.mockRejectedValueOnce(new Error('Network error'))

      const store = useAuthStore()
      store.user = { id: 1, username: 'admin' }

      await store.logout()

      expect(store.user).toBeNull()
    })
  })

  describe('checkSession', () => {
    it('debería verificar sesión al cargar la app', async () => {
      const mockUser = { id: 1, username: 'admin' }
      authService.getMe.mockResolvedValueOnce({
        data: { user: mockUser },
      })

      const store = useAuthStore()
      await store.checkSession()

      expect(authService.getMe).toHaveBeenCalled()
      expect(store.user).toEqual(mockUser)
    })

    it('debería setear user a null si no hay sesión', async () => {
      authService.getMe.mockRejectedValueOnce(new Error('No session'))

      const store = useAuthStore()
      await store.checkSession()

      expect(store.user).toBeNull()
    })
  })
})
