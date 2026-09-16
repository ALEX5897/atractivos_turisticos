<template>
  <div class="layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <img src="/img/logo_sicet-09.png" alt="SICET" class="sidebar-logo" />
        <span v-if="!sidebarCollapsed" class="sidebar-title">Turismo</span>
      </div>

      <nav class="sidebar-nav">
        <a
          v-for="item in navItems"
          :key="item.name"
          href="#"
          class="nav-item"
          :class="{ active: activeSection === item.name }"
          @click.prevent="handleNav(item.name)"
        >
          <component :is="item.icon" class="nav-icon" />
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
        </a>

        <div
          v-if="activeSection === 'catalogos' && !sidebarCollapsed"
          class="catalogos-submenu"
        >
          <button
            v-for="cat in catalogItems"
            :key="cat.key"
            class="submenu-item"
            :class="{ active: activeCatalog === cat.key }"
            @click="selectCatalog(cat.key)"
          >
            {{ cat.label }}
          </button>
        </div>
      </nav>

      <div v-if="!sidebarCollapsed" class="sidebar-footer">
        <span class="sidebar-org">Quito Turismo</span>
      </div>

      <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline :points="sidebarCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'" />
        </svg>
      </button>
    </aside>

    <!-- Contenido principal -->
    <div class="main-wrapper">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
        <div class="topbar-right">
          <button class="btn-theme-toggle" @click="toggleDarkMode" :title="isDarkMode ? 'Modo claro' : 'Modo oscuro'">
            <svg v-if="isDarkMode" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </button>

          <div
            v-click-outside="() => userMenuOpen = false"
            class="user-menu"
            @click="userMenuOpen = !userMenuOpen"
          >
            <div class="user-avatar">{{ userInitials }}</div>
            <div v-if="!isMobile" class="user-info">
              <span class="user-name">{{ authStore.userName }}</span>
              <span class="user-email">{{ authStore.userEmail }}</span>
            </div>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>

            <div v-if="userMenuOpen" class="user-dropdown">
              <div class="dropdown-header">
                <strong>{{ authStore.userName }}</strong>
                <small>{{ authStore.userEmail }}</small>
              </div>
              <hr class="dropdown-divider" />
              <button class="dropdown-item logout-item" @click="handleLogout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido -->
      <main class="main-content">
        <Transition name="fade-slide" mode="out-in">
          <!-- Dashboard -->
          <DashboardSection v-if="activeSection === 'dashboard'" key="dashboard" @navigate="activeSection = $event" />

          <!-- Secciones CRUD -->
          <AtractivosSection v-else-if="activeSection === 'atractivos'" key="atractivos" />
          <ExperienciasSection v-else-if="activeSection === 'experiencias'" key="experiencias" />
          <RutasSection v-else-if="activeSection === 'rutas'" key="rutas" />
          <CatalogosSection
            v-else-if="activeSection === 'catalogos'"
            :initial-table="activeCatalog"
            key="catalogos"
          />
          <UsuariosSection v-else-if="activeSection === 'usuarios'" key="usuarios" />
          <RolesSection v-else-if="activeSection === 'roles'" key="roles" />
          <AuditoriaSection v-else-if="activeSection === 'auditoria'" key="auditoria" />
          <ReportesSection v-else-if="activeSection === 'reportes'" key="reportes" />
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'
import DashboardSection from '@/views/sections/DashboardSection.vue'
import AtractivosSection from '@/views/sections/AtractivosSection.vue'
import ExperienciasSection from '@/views/sections/ExperienciasSection.vue'
import RutasSection from '@/views/sections/RutasSection.vue'
import CatalogosSection from '@/views/sections/CatalogosSection.vue'
import UsuariosSection from '@/views/sections/UsuariosSection.vue'
import RolesSection from '@/views/sections/RolesSection.vue'
import AuditoriaSection from '@/views/sections/AuditoriaSection.vue'
import ReportesSection from '@/views/sections/ReportesSection.vue'

const authStore = useAuthStore()
const { isDarkMode, toggleDarkMode } = useDarkMode()

const sidebarCollapsed = ref(false)
const activeSection    = ref('dashboard')
const userMenuOpen     = ref(false)
const isMobile         = ref(window.innerWidth < 768)

const mkIcon = (paths) => ({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, paths.map((p) => h(...p))) })
const IconDashboard    = mkIcon([['rect', { x: '3', y: '3', width: '7', height: '7' }], ['rect', { x: '14', y: '3', width: '7', height: '7' }], ['rect', { x: '14', y: '14', width: '7', height: '7' }], ['rect', { x: '3', y: '14', width: '7', height: '7' }]])
const IconAtractivos   = mkIcon([['path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }], ['polyline', { points: '9 22 9 12 15 12 15 22' }]])
const IconExperiencias = mkIcon([['polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }]])
const IconRutas        = mkIcon([['path', { d: 'M3 12h18' }], ['path', { d: 'M3 6h18' }], ['path', { d: 'M3 18h18' }]])
const IconCatalogos    = mkIcon([['circle', { cx: '6', cy: '6', r: '3' }], ['circle', { cx: '18', cy: '6', r: '3' }], ['circle', { cx: '6', cy: '18', r: '3' }], ['circle', { cx: '18', cy: '18', r: '3' }]])
const IconUsuarios     = mkIcon([['path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }], ['circle', { cx: '9', cy: '7', r: '4' }], ['path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }], ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }]])
const IconRoles       = mkIcon([['polygon', { points: '12 2 20 6 20 14 12 18 4 14 4 6 12 2' }], ['line', { x1: '12', y1: '9', x2: '12', y2: '17' }], ['polyline', { points: '9 11 12 13 15 11' }]])
const IconAuditoria   = mkIcon([['path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' }]])
const IconReportes    = mkIcon([['path', { d: 'M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7h18M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' }], ['rect', { x: '6', y: '10', width: '3', height: '4' }], ['rect', { x: '12', y: '10', width: '3', height: '6' }], ['rect', { x: '18', y: '10', width: '3', height: '5' }]])

const allNavItems = [
  { name: 'dashboard',    label: 'Dashboard',    icon: IconDashboard, permiso: null },
  { name: 'atractivos',   label: 'Atractivos',   icon: IconAtractivos, permiso: 'ATRACTIVOS_VER' },
  { name: 'experiencias', label: 'Experiencias', icon: IconExperiencias, permiso: 'EXPERIENCIAS_VER' },
  { name: 'rutas',        label: 'Rutas',        icon: IconRutas, permiso: 'RUTAS_VER' },
  { name: 'catalogos',    label: 'Catalogos',    icon: IconCatalogos, permiso: 'CATALOGOS_VER' },
  { name: 'usuarios',     label: 'Usuarios',     icon: IconUsuarios, permiso: 'USUARIOS_VER' },
  { name: 'roles',        label: 'Roles',        icon: IconRoles, permiso: 'ROLES_VER' },
  { name: 'auditoria',    label: 'Auditoría',    icon: IconAuditoria, permiso: null },
  { name: 'reportes',     label: 'Reportes',     icon: IconReportes, permiso: 'REPORTES_VER' },
]

const navItems = computed(() => {
  try {
    return allNavItems.filter(item => !item.permiso || authStore.hasPermission(item.permiso))
  } catch {
    return allNavItems.filter(item => !item.permiso)
  }
})

const catalogItems = [
  { key: 'nodo', label: 'Nodo' },
  { key: 'centralidad', label: 'Centralidad' },
  { key: 'parroquia', label: 'Parroquia' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'subtipo', label: 'Subtipo' },
  { key: 'modalidad', label: 'Modalidad' },
]

const activeCatalog = ref('nodo')

const currentPageTitle = computed(() => {
  const section = activeSection.value
  const item = allNavItems.find((i) => i.name === section)
  return item?.label || ''
})

const userInitials = computed(() => {
  const name = authStore.userName
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()
})

async function handleLogout() {
  userMenuOpen.value = false
  await authStore.logout()
}

const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(e) }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) { document.removeEventListener('click', el._clickOutside) },
}

function handleResize() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) sidebarCollapsed.value = true
}

function handleNav(name) {
  activeSection.value = name
  if (name === 'catalogos' && !activeCatalog.value) {
    activeCatalog.value = 'nodo'
  }
}

function selectCatalog(key) {
  activeSection.value = 'catalogos'
  activeCatalog.value = key
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
.layout { display: flex; min-height: 100vh; background: #f8fafc; }

.layout.sidebar-collapsed .main-wrapper {
  margin-left: 64px;
}

@media (max-width: 480px) {
  .layout.sidebar-collapsed .main-wrapper {
    margin-left: 0;
  }
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #003f87 0%, #0052b3 100%);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease, transform 0.25s ease;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-collapsed { width: 64px; }

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
    transform: translateX(-100%);
  }

  .sidebar.sidebar-collapsed {
    transform: translateX(0);
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sidebar-logo { width: 32px; height: 32px; flex-shrink: 0; object-fit: contain; filter: brightness(1.1); }

.sidebar-title {
  color: white;
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover { background: rgba(255,255,255,0.12); color: white; }
.nav-item.active { background: rgba(255,255,255,0.15); color: white; border-left: 4px solid #34c759; padding-left: calc(1rem - 1px); }

.nav-icon { width: 20px; height: 20px; flex-shrink: 0; }
.nav-label { font-size: 0.9rem; font-weight: 500; }

.catalogos-submenu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem 0.75rem 2.75rem;
}

.submenu-item {
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255,255,255,0.7);
  text-align: left;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.submenu-item:hover {
  background: rgba(255,255,255,0.08);
  color: white;
}

.submenu-item.active {
  background: rgba(52, 199, 89, 0.25);
  color: #34c759;
  border-color: rgba(52, 199, 89, 0.5);
}

.sidebar-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.sidebar-org {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
}

.collapse-btn {
  margin: 0.75rem;
  padding: 0.5rem;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.collapse-btn:hover { background: rgba(255,255,255,0.2); }
.collapse-btn svg { width: 20px; height: 20px; }

/* Main */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 240px;
  transition: margin-left 0.25s ease;
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 64px;
  }
}

@media (max-width: 480px) {
  .main-wrapper {
    margin-left: 0;
  }
}

.topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .topbar {
    padding: 0.875rem 1rem;
  }
}

.page-title { font-size: 1.5rem; font-weight: 800; color: #003f87; margin: 0; letter-spacing: -0.5px; }

:global(.dark) .page-title { color: #60a5fa; }

.topbar-right { position: relative; display: flex; align-items: center; gap: 1rem; }

.btn-theme-toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.btn-theme-toggle:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-theme-toggle svg {
  width: 20px;
  height: 20px;
}

:global(.dark) .btn-theme-toggle {
  color: #9ca3af;
}

:global(.dark) .btn-theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #d1d5db;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  padding: 0.375rem 0.5rem;
  border-radius: 8px;
  transition: background 0.15s;
  user-select: none;
}

.user-menu:hover { background: #f3f4f6; }

.user-avatar {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #003f87 0%, #0052b3 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 63, 135, 0.3);
}

.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.875rem; font-weight: 600; color: #111827; line-height: 1.2; }
.user-email { font-size: 0.75rem; color: #6b7280; }
.chevron { width: 16px; height: 16px; color: #6b7280; }

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 63, 135, 0.15);
  min-width: 220px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-header { padding: 0.875rem 1rem; display: flex; flex-direction: column; gap: 0.125rem; }
.dropdown-header strong { font-size: 0.875rem; color: #111827; }
.dropdown-header small { font-size: 0.75rem; color: #6b7280; }
.dropdown-divider { border: none; border-top: 1px solid #e5e7eb; margin: 0; }
.dropdown-item { display: flex; align-items: center; gap: 0.625rem; width: 100%; padding: 0.75rem 1rem; background: none; border: none; font-size: 0.875rem; cursor: pointer; transition: background 0.15s; text-align: left; }
.dropdown-item svg { width: 16px; height: 16px; }
.logout-item { color: #ef4444; }
.logout-item:hover { background: #fef2f2; }

/* Main content */
.main-content { flex: 1; padding: 2rem; overflow-y: auto; }

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
  }
}

/* Page Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

</style>
