import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/IndexView.vue'),
    meta: { requiresAuth: true },
  },
  // Catch-all: redirige al login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard global de navegación
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Verifica sesión si el usuario no está cargado aún
  if (authStore.user === null && to.meta.requiresAuth) {
    await authStore.checkSession()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'index' }
  }
})

export default router
