<template>
  <component
    :is="icon"
    :class="['app-icon', `size-${size}`, `color-${color}`]"
    :style="customStyle"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useIcons } from '@/composables/useIcons'

const props = defineProps({
  name: {
    type: String,
    required: true,
    validator: (val) => [
      'dashboard', 'atractivos', 'experiencias', 'rutas', 'catalogos',
      'usuarios', 'roles', 'auditoria', 'reportes',
      'plus', 'edit', 'trash', 'view', 'search', 'x', 'check',
      'arrow-right', 'success', 'warning', 'error', 'info',
      'loader', 'menu', 'logout'
    ].includes(val)
  },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(val)
  },
  color: {
    type: String,
    default: 'current',
    validator: (val) => [
      'current', 'primary', 'success', 'warning', 'error',
      'info', 'secondary', 'muted'
    ].includes(val)
  }
})

const icons = useIcons()
const iconMap = {
  'dashboard': icons.IconDashboard,
  'atractivos': icons.IconAtractivos,
  'experiencias': icons.IconExperiencias,
  'rutas': icons.IconRutas,
  'catalogos': icons.IconCatalogos,
  'usuarios': icons.IconUsuarios,
  'roles': icons.IconRoles,
  'auditoria': icons.IconAuditoria,
  'reportes': icons.IconReportes,
  'plus': icons.IconPlus,
  'edit': icons.IconEdit,
  'trash': icons.IconTrash,
  'view': icons.IconView,
  'search': icons.IconSearch,
  'x': icons.IconX,
  'check': icons.IconCheck,
  'arrow-right': icons.IconArrowRight,
  'success': icons.IconSuccess,
  'warning': icons.IconWarning,
  'error': icons.IconError,
  'info': icons.IconInfo,
  'loader': icons.IconLoader,
  'menu': icons.IconMenu,
  'logout': icons.IconLogout
}

const icon = computed(() => iconMap[props.name] || icons.IconInfo)

const customStyle = computed(() => {
  const sizeMap = { xs: '14px', sm: '16px', md: '20px', lg: '24px', xl: '32px' }
  return { width: sizeMap[props.size], height: sizeMap[props.size] }
})
</script>

<style scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-icon svg {
  width: 100%;
  height: 100%;
}

/* Sizes */
.size-xs { width: 14px; height: 14px; }
.size-sm { width: 16px; height: 16px; }
.size-md { width: 20px; height: 20px; }
.size-lg { width: 24px; height: 24px; }
.size-xl { width: 32px; height: 32px; }

/* Colors */
.color-current { color: currentColor; }
.color-primary { color: #003f87; }
.color-success { color: #10b981; }
.color-warning { color: #f59e0b; }
.color-error { color: #ef4444; }
.color-info { color: #3b82f6; }
.color-secondary { color: #6b7280; }
.color-muted { color: #9ca3af; }

/* Dark mode */
:global(.dark) .color-primary { color: #60a5fa; }
:global(.dark) .color-secondary { color: #cbd5e1; }
:global(.dark) .color-muted { color: #94a3b8; }
</style>
