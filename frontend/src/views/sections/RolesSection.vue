<template>
  <div class="section">
    <!-- Toolbar -->
    <div class="toolbar">
      <button class="btn-create" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo Rol
      </button>
    </div>

    <!-- KPIs -->
    <div class="kpis-section">
      <div class="kpis-row">
        <div class="kpi-card">
          <div class="kpi-label">Total de Roles</div>
          <div class="kpi-value">{{ total }}</div>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <AppTable
      :columns="columns"
      :data="items"
      :loading="loading"
      :total="total"
      :page="filters.page"
      :limit="filters.limit"
      row-key="id"
      @page-change="onPageChange"
    >
      <template #cell-permisos_count="{ value }">
        <span class="badge badge-info">{{ value }} permisos</span>
      </template>

      <template #cell-estado="{ value }">
        <span class="badge" :class="value === 'ACTIVO' ? 'badge-success' : 'badge-danger'">
          {{ value }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="action-btns">
          <button class="btn-icon btn-edit" title="Editar" @click="openEdit(row)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon btn-copy" title="Duplicar" @click="duplicateRole(row)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button class="btn-icon btn-delete" title="Eliminar" @click="openDelete(row)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <!-- Modal Crear / Editar -->
    <AppModal
      v-model="showModal"
      :title="editingRole ? 'Editar Rol' : 'Nuevo Rol'"
      @save="handleSave"
      :loading="saving"
      size="xl"
    >
      <AppTabs :tabs="['Información', 'Permisos']" v-model="activeTab">
        <template #tab-0>
          <div class="grid-1">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="form.nombre" type="text" class="form-input" placeholder="ej: Supervisor" />
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="form.descripcion" class="form-input" rows="3"
                placeholder="Describe el propósito de este rol..."></textarea>
            </div>

            <div class="form-group">
              <label>
                <input v-model="form.estado" value="ACTIVO" type="radio" />
                Activo
              </label>
              <label>
                <input v-model="form.estado" value="INACTIVO" type="radio" />
                Inactivo
              </label>
            </div>
          </div>
        </template>

        <template #tab-1>
          <div class="permisos-grid">
            <div v-for="modulo in modulosUnicos" :key="modulo" class="modulo-group">
              <h4 class="modulo-title">{{ moduloLabel(modulo) }}</h4>
              <div class="permisos-list">
                <label v-for="perm in permisosDelModulo(modulo)" :key="perm.id" class="checkbox-label">
                  <input
                    type="checkbox"
                    :checked="selectedPermisos.includes(perm.id)"
                    @change="togglePermiso($event, perm.id)"
                  />
                  <span class="checkbox-text">{{ perm.nombre }}</span>
                </label>
              </div>
            </div>
          </div>
        </template>
      </AppTabs>
    </AppModal>

    <!-- Modal Confirmar Eliminación -->
    <AppModal
      v-if="itemToDelete"
      v-model="showDeleteConfirm"
      title="Confirmar Eliminación"
      danger
      confirm-only
      @save="confirmDelete"
    >
      <p>¿Está seguro que desea eliminar el rol <strong>{{ itemToDelete.nombre }}</strong>?</p>
      <p class="text-secondary">Esta acción no se puede deshacer si no hay usuarios asignados.</p>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppTable from '@/components/AppTable.vue'
import AppModal from '@/components/AppModal.vue'
import AppTabs from '@/components/AppTabs.vue'
import { rolesService } from '@/services/roles'

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const total = ref(0)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const itemToDelete = ref(null)
const editingRole = ref(null)
const activeTab = ref(0)
const allPermisos = ref([])
const selectedPermisos = ref([])

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'permisos_count', label: 'Permisos' },
  { key: 'estado', label: 'Estado' },
]

const filters = ref({
  page: 1,
  limit: 15,
})

const form = ref({
  nombre: '',
  descripcion: '',
  estado: 'ACTIVO',
})

const modulosUnicos = computed(() => {
  return [...new Set(allPermisos.value.map(p => p.modulo))].sort()
})

const permisosDelModulo = (modulo) => {
  return allPermisos.value
    .filter(p => p.modulo === modulo)
    .sort((a, b) => {
      const orden = { ver: 0, crear: 1, editar: 2, eliminar: 3 }
      return (orden[a.accion] || 999) - (orden[b.accion] || 999)
    })
}

const moduloLabel = (modulo) => {
  const labels = {
    atractivos: '🏛️ Atractivos',
    experiencias: '🎭 Experiencias',
    rutas: '🛤️ Rutas',
    catalogos: '📚 Catálogos',
    usuarios: '👥 Usuarios',
    roles: '🔐 Roles',
  }
  return labels[modulo] || modulo
}

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await rolesService.getAll(filters.value)
    items.value = data.data
    total.value = data.total
  } catch (err) {
    console.error('Error fetching roles:', err)
    alert('Error al obtener roles')
  } finally {
    loading.value = false
  }
}

async function getPermisos() {
  try {
    const { data } = await rolesService.getAllPermisos()
    allPermisos.value = data.data
  } catch (err) {
    console.error('Error fetching permisos:', err)
  }
}

function openCreate() {
  editingRole.value = null
  form.value = { nombre: '', descripcion: '', estado: 'ACTIVO' }
  selectedPermisos.value = []
  activeTab.value = 0
  showModal.value = true
}

async function openEdit(row) {
  try {
    const { data } = await rolesService.getById(row.id)
    editingRole.value = data.data
    form.value = {
      nombre: data.data.nombre,
      descripcion: data.data.descripcion,
      estado: data.data.estado,
    }
    selectedPermisos.value = (data.data.permisos || []).map(p => p.id)
    activeTab.value = 0
    showModal.value = true
  } catch (err) {
    console.error('Error fetching rol:', err)
    alert('Error al obtener rol')
  }
}

async function handleSave() {
  if (!form.value.nombre.trim()) {
    alert('El nombre del rol es requerido')
    return
  }

  saving.value = true
  try {
    if (editingRole.value) {
      // Actualizar rol existente
      await rolesService.update(editingRole.value.id, {
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        estado: form.value.estado,
      })
      // Actualizar permisos
      await rolesService.assignPermisos(editingRole.value.id, selectedPermisos.value)
    } else {
      // Crear nuevo rol
      const { data } = await rolesService.create({
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        estado: form.value.estado,
      })
      // Asignar permisos
      await rolesService.assignPermisos(data.data.id, selectedPermisos.value)
    }
    showModal.value = false
    fetchItems()
  } catch (err) {
    console.error('Error saving rol:', err)
    alert('Error al guardar rol: ' + err.response?.data?.error)
  } finally {
    saving.value = false
  }
}

function togglePermiso(event, id) {
  if (event.target.checked) {
    if (!selectedPermisos.value.includes(id)) {
      selectedPermisos.value.push(id)
    }
  } else {
    const idx = selectedPermisos.value.indexOf(id)
    if (idx > -1) {
      selectedPermisos.value.splice(idx, 1)
    }
  }
}

function openDelete(row) {
  itemToDelete.value = row
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!itemToDelete.value) return

  saving.value = true
  try {
    await rolesService.remove(itemToDelete.value.id)
    showDeleteConfirm.value = false
    itemToDelete.value = null
    fetchItems()
  } catch (err) {
    console.error('Error deleting rol:', err)
    alert('Error al eliminar rol: ' + err.response?.data?.error)
  } finally {
    saving.value = false
  }
}

async function duplicateRole(row) {
  const newName = prompt(`Nombre del nuevo rol (copia de ${row.nombre}):`, `${row.nombre}_copia`)
  if (!newName) return

  saving.value = true
  try {
    const { data } = await rolesService.create({
      nombre: newName,
      descripcion: row.descripcion,
      estado: 'ACTIVO',
    })

    // Copiar permisos del rol original
    const { data: originalRole } = await rolesService.getById(row.id)
    const permisosIds = originalRole.data.permisos.map(p => p.id)
    await rolesService.assignPermisos(data.data.id, permisosIds)

    fetchItems()
    alert('Rol duplicado correctamente')
  } catch (err) {
    console.error('Error duplicating rol:', err)
    alert('Error al duplicar rol')
  } finally {
    saving.value = false
  }
}

function onPageChange(newPage) {
  filters.value.page = newPage
  fetchItems()
}

onMounted(() => {
  getPermisos()
  fetchItems()
})
</script>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #1a56a0, #2d7dd2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-create:hover {
  opacity: 0.9;
}

.btn-create svg {
  width: 18px;
  height: 18px;
}

.kpis-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.kpis-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.kpi-card {
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kpi-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a56a0;
}

.badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.permisos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-top: 20px;
}

.modulo-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modulo-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.permisos-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-text {
  flex: 1;
}

.grid-1 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.form-group label input[type="radio"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  padding: 0.625rem 0.875rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.15s;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #1a56a0;
  box-shadow: 0 0 0 3px rgba(26, 86, 160, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  color: #6b7280;
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-edit {
  color: #0ea5e9;
}

.btn-edit:hover {
  background-color: rgba(6, 182, 212, 0.1);
}

.btn-copy {
  color: #6366f1;
}

.btn-copy:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
}
</style>
