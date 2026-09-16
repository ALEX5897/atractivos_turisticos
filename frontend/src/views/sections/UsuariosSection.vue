<template>
  <div class="section">
    <div class="toolbar">
      <div class="search-box">
        <input v-model="filters.q" type="search" placeholder="Buscar usuario..." class="search-input" @input="debouncedFetch" />
      </div>
      <button class="btn-create" @click="openCreate">Nuevo Usuario</button>
    </div>

    <AppTable :columns="columns" :data="items" :loading="loading" :total="total" :page="filters.page" :limit="filters.limit" row-key="id" @page-change="onPageChange" @limit-change="onLimitChange">
      <template #cell-estado="{ value }">
        <span class="badge" :class="badgeClass(value)">{{ value }}</span>
      </template>
      <template #cell-rol="{ value }">
        <span class="badge badge-info">{{ value || '—' }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="actions">
          <button class="action-btn edit" @click="openEdit(row)">Editar</button>
          <button class="action-btn delete" @click="openDelete(row)">Eliminar</button>
        </div>
      </template>
    </AppTable>

    <AppModal v-model="showModal" :title="editingItem ? 'Editar Usuario' : 'Crear Usuario'" size="md" :loading="saving" :error="modalError" @save="saveUser">
      <div class="form-group">
        <label>Username <span v-if="!editingItem" class="req">*</span></label>
        <input v-model="form.username" type="text" class="f-input" :disabled="!!editingItem" />
      </div>
      <div v-if="!editingItem" class="form-group">
        <label>Email <span class="req">*</span></label>
        <input v-model="form.email" type="email" class="f-input" />
      </div>
      <div v-if="!editingItem" class="form-group">
        <label>Nombre <span class="req">*</span></label>
        <input v-model="form.nombre" type="text" class="f-input" />
      </div>
      <div v-if="!editingItem" class="form-group">
        <label>Contraseña <span class="req">*</span></label>
        <input v-model="form.password" type="password" class="f-input" placeholder="Ingrese contraseña" />
      </div>
      <div class="form-group">
        <label>Rol</label>
        <select v-model="form.id_rol" class="f-select">
          <option value="">Seleccionar rol...</option>
          <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Estado</label>
        <select v-model="form.estado" class="f-select">
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>
    </AppModal>

    <AppModal v-model="showDeleteModal" title="Eliminar Usuario" size="sm" :loading="deleting" :error="deleteError" save-label="Eliminar" :danger="true" @save="confirmDelete">
      <p>¿Eliminar usuario <strong>{{ deleteTarget?.username }}</strong>?</p>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AppTable from '@/components/AppTable.vue'
import AppModal from '@/components/AppModal.vue'
import { usuariosService } from '@/services/usuarios'

const items = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingItem = ref(null)
const deleteTarget = ref(null)
const modalError = ref('')
const deleteError = ref('')
const roles = ref([])

const columns = [
  { key: 'username', label: 'Usuario', width: '150px' },
  { key: 'nombre', label: 'Nombre', width: '180px' },
  { key: 'email', label: 'Email', width: '200px' },
  { key: 'rol', label: 'Rol', width: '120px' },
  { key: 'estado', label: 'Estado', width: '100px' },
  { key: 'actions', label: 'Acciones', width: '100px' }
]

const filters = reactive({ q: '', page: 1, limit: 15 })

const emptyForm = () => ({ username: '', email: '', nombre: '', password: '', id_rol: '', estado: 'ACTIVO' })
const form = reactive(emptyForm())

const badgeClass = (estado) => ({ 'ACTIVO': 'badge-success', 'INACTIVO': 'badge-danger' }[estado] || 'badge-default')

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await usuariosService.getAll({ page: filters.page, limit: filters.limit, q: filters.q })
    items.value = data.data
    total.value = data.total
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

let debounceTimer
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { filters.page = 1; fetchItems() }, 350)
}

function onPageChange(p) { filters.page = p; fetchItems() }
function onLimitChange(l) { filters.page = 1; filters.limit = l; fetchItems() }

function openCreate() {
  Object.assign(form, emptyForm())
  editingItem.value = null
  modalError.value = ''
  showModal.value = true
}

async function openEdit(row) {
  try {
    const { data } = await usuariosService.getById(row.id)
    Object.assign(form, data.data)
    editingItem.value = data.data
    modalError.value = ''
    showModal.value = true
  } catch (err) {
    console.error('Error fetching user:', err)
  }
}

function openDelete(row) {
  deleteTarget.value = row
  deleteError.value = ''
  showDeleteModal.value = true
}

async function saveUser() {
  modalError.value = ''
  if (!form.username || !form.email || !form.nombre) {
    modalError.value = 'Username, email y nombre son requeridos'
    return
  }
  if (!editingItem.value && !form.password) {
    modalError.value = 'La contraseña es requerida para nuevos usuarios'
    return
  }
  saving.value = true
  try {
    if (editingItem.value) {
      await usuariosService.update(editingItem.value.id, { id_rol: form.id_rol || null, estado: form.estado })
    } else {
      await usuariosService.create({ username: form.username, email: form.email, nombre: form.nombre, password: form.password, id_rol: form.id_rol || null, estado: form.estado })
    }
    showModal.value = false
    fetchItems()
  } catch (err) {
    modalError.value = err.response?.data?.error || 'Error al guardar usuario'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  deleteError.value = ''
  deleting.value = true
  try {
    await usuariosService.delete(deleteTarget.value.id)
    showDeleteModal.value = false
    fetchItems()
  } catch (err) {
    deleteError.value = err.response?.data?.error || 'Error al eliminar usuario'
  } finally {
    deleting.value = false
  }
}

async function fetchRoles() {
  try {
    const { data } = await usuariosService.getRoles({ limit: 100 })
    roles.value = data.data || []
  } catch (err) {
    console.error('Error fetching roles:', err)
    roles.value = []
  }
}

onMounted(() => { fetchItems(); fetchRoles() })
</script>

<style scoped>
.section { padding: 20px; }
.toolbar { display: flex; gap: 15px; margin-bottom: 20px; }
.search-box { flex: 1; }
.search-input { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
.search-input:focus { outline: none; border-color: #0066cc; }
.btn-create { padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; }
.btn-create:hover { background: #0052a3; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.badge-success { background: #d4edda; color: #155724; }
.badge-danger { background: #f8d7da; color: #721c24; }
.badge-info { background: #d1ecf1; color: #0c5460; }
.actions { display: flex; gap: 8px; }
.action-btn { padding: 4px 12px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 12px; }
.action-btn:hover { background: #f5f5f5; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
.form-group .req { color: #dc3545; }
.f-input, .f-select { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
.f-input:focus, .f-select:focus { outline: none; border-color: #0066cc; box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1); }
.f-input:disabled { background: #f5f5f5; cursor: not-allowed; }
</style>
