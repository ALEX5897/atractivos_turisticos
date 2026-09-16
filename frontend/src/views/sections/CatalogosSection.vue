<template>
  <div class="section">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="filters.q"
            type="search"
            placeholder="Buscar en el catalogo..."
            class="search-input"
            @input="debouncedFetch"
          />
        </div>

        <select v-model="activeTable" class="filter-select" @change="handleTableChange">
          <option v-for="t in tables" :key="t.key" :value="t.key">
            {{ t.label }}
          </option>
        </select>
      </div>

      <button class="btn-create" :disabled="!activeTable" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nuevo registro
      </button>
    </div>

    <!-- Tabla -->
    <AppTable
      :columns="tableColumns"
      :data="items"
      :loading="loading"
      :total="total"
      :page="filters.page"
      :limit="filters.limit"
      :row-key="currentIdKey"
      @page-change="onPageChange"
    >
      <template #cell-cod_nodo="{ value }">
        <code class="cell-code">{{ padCode(value) }}</code>
      </template>
      <template #cell-cod_centralidad="{ value }">
        <code class="cell-code">{{ padCode(value) }}</code>
      </template>
      <template #cell-cod_dpa="{ value }">
        <code class="cell-code">{{ padCode(value) }}</code>
      </template>
      <template #cell-cod_categoria="{ value }">
        <code class="cell-code">{{ padCode(value) }}</code>
      </template>
      <template #cell-cod_tipo="{ value }">
        <code class="cell-code">{{ padCode(value) }}</code>
      </template>
      <template #cell-cod_subtipo="{ value }">
        <code class="cell-code">{{ padCode(value) }}</code>
      </template>
      <template #cell-cod_modalidad="{ value }">
        <code class="cell-code">{{ padCode(value) }}</code>
      </template>

      <template #actions="{ row }">
        <div class="action-btns">
          <button class="btn-icon btn-edit" title="Editar" @click="openEdit(row)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button class="btn-icon btn-delete" title="Eliminar" @click="openDelete(row)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <!-- Modal Crear / Editar -->
    <AppModal
      v-model="showModal"
      :title="editingItem ? 'Editar registro' : 'Nuevo registro'"
      size="sm"
      :loading="saving"
      :error="modalError"
      @save="handleSave"
    >
      <div class="form-grid">
        <div class="form-section">
          <h4 class="form-section-title">{{ currentTableLabel }}</h4>
          <div :class="gridClass">
            <div v-for="col in currentColumns" :key="col.key" class="field">
              <label>{{ col.label }}</label>
              <input v-model="form[col.key]" type="text" class="f-input" />
            </div>
          </div>
        </div>
      </div>
    </AppModal>

    <!-- Modal Eliminar -->
    <AppModal
      v-model="showDeleteModal"
      title="Eliminar registro"
      size="sm"
      :loading="deleting"
      :error="deleteError"
      save-label="Eliminar"
      :danger="true"
      @save="confirmDelete"
    >
      <p class="confirm-text">
        ¿Está seguro que desea eliminar este registro del catalogo?
        Esta acción no se puede deshacer.
      </p>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import AppTable from '@/components/AppTable.vue'
import AppModal from '@/components/AppModal.vue'
import { catalogosAdminService } from '@/services/catalogosAdmin'

const props = defineProps({
  initialTable: { type: String, default: '' },
})

// Función para formatear códigos con padding de ceros
const padCode = (code) => {
  if (code === null || code === undefined || code === '') return code
  const strCode = String(code).trim()
  const numCode = parseInt(strCode, 10)
  // Aplicar padding para números 1-9
  if (!isNaN(numCode) && numCode >= 1 && numCode <= 9) {
    return '0' + numCode
  }
  return strCode
}

const tables = ref([])
const activeTable = ref('')

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

const filters = reactive({ q: '', page: 1, limit: 15 })
const form = reactive({})

const currentTable = computed(() => tables.value.find((t) => t.key === activeTable.value) || null)
const currentColumns = computed(() => currentTable.value?.columns || [])
const currentTableLabel = computed(() => currentTable.value?.label || 'Catalogo')
const currentIdKey = computed(() => currentTable.value?.id || 'id')

const tableColumns = computed(() =>
  currentColumns.value.map((c) => ({ key: c.key, label: c.label, width: '220px' }))
)

const gridClass = computed(() => (currentColumns.value.length > 2 ? 'grid-2' : 'grid-1'))

async function fetchTables() {
  const { data } = await catalogosAdminService.getTables()
  tables.value = data.data || []
  if (props.initialTable) {
    activeTable.value = props.initialTable
  } else if (!activeTable.value && tables.value.length) {
    activeTable.value = tables.value[0].key
  }
}

async function fetchItems() {
  if (!activeTable.value) return
  loading.value = true
  try {
    const { data } = await catalogosAdminService.getAll(activeTable.value, {
      page: filters.page,
      limit: filters.limit,
      q: filters.q,
    })
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
  debounceTimer = setTimeout(() => { filters.page = 1; fetchItems() }, 300)
}

function onPageChange(p) { filters.page = p; fetchItems() }

function resetForm() {
  currentColumns.value.forEach((c) => { form[c.key] = '' })
}

function openCreate() {
  resetForm()
  editingItem.value = null
  modalError.value = ''
  showModal.value = true
}

function openEdit(row) {
  resetForm()
  currentColumns.value.forEach((c) => { form[c.key] = row[c.key] ?? '' })
  editingItem.value = row
  modalError.value = ''
  showModal.value = true
}

function openDelete(row) {
  deleteTarget.value = row
  deleteError.value = ''
  showDeleteModal.value = true
}

async function handleSave() {
  modalError.value = ''
  saving.value = true
  try {
    // Formatear códigos automáticamente (agregar 0 a la izquierda para 1-9)
    const formattedForm = { ...form }
    Object.keys(formattedForm).forEach(key => {
      if (key.startsWith('cod_') || key === 'codigo') {
        formattedForm[key] = padCode(formattedForm[key])
      }
    })

    if (editingItem.value) {
      await catalogosAdminService.update(activeTable.value, editingItem.value[currentIdKey.value], formattedForm)
    } else {
      await catalogosAdminService.create(activeTable.value, formattedForm)
    }
    showModal.value = false
    fetchItems()
  } catch (err) {
    modalError.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  try {
    await catalogosAdminService.remove(activeTable.value, deleteTarget.value[currentIdKey.value])
    showDeleteModal.value = false
    fetchItems()
  } catch (err) {
    deleteError.value = err.response?.data?.error || 'Error al eliminar'
  } finally {
    deleting.value = false
  }
}

async function handleTableChange() {
  filters.page = 1
  filters.q = ''
  await fetchItems()
}

watch(
  () => props.initialTable,
  async (next) => {
    if (!next || next === activeTable.value) return
    activeTable.value = next
    await handleTableChange()
  }
)

onMounted(async () => {
  await fetchTables()
  await fetchItems()
})
</script>

<style scoped>
.section { display: flex; flex-direction: column; gap: 1rem; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  flex: 1;
}

.search-box { position: relative; flex: 1; min-width: 220px; max-width: 360px; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #374151; background: white; box-sizing: border-box; transition: border-color 0.15s; }
.search-input:focus { outline: none; border-color: #1a56a0; }
.filter-select { padding: 0.5rem 0.75rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #374151; background: white; cursor: pointer; }
.filter-select:focus { outline: none; border-color: #1a56a0; }

.btn-create { display: flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1.125rem; background: linear-gradient(135deg, #1a56a0, #2d7dd2); color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: opacity 0.15s; }
.btn-create:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-create:hover:not(:disabled) { opacity: 0.9; }
.btn-create svg { width: 16px; height: 16px; }

.cell-code { font-family: monospace; font-size: 0.8125rem; color: #4b5563; }

.action-btns { display: flex; align-items: center; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer; transition: all 0.15s; }
.btn-icon svg { width: 14px; height: 14px; }
.btn-edit { color: #1a56a0; }
.btn-edit:hover { background: #dbeafe; border-color: #1a56a0; }
.btn-delete { color: #dc2626; }
.btn-delete:hover { background: #fee2e2; border-color: #dc2626; }

.form-grid { display: flex; flex-direction: column; gap: 1.25rem; }
.form-section { display: flex; flex-direction: column; gap: 0.75rem; }
.form-section-title { font-size: 0.8125rem; font-weight: 700; color: #1a56a0; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
.grid-1 { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
.f-input { width: 100%; padding: 0.5rem 0.75rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #374151; background: white; box-sizing: border-box; font-family: inherit; transition: border-color 0.15s; }
.f-input:focus { outline: none; border-color: #1a56a0; }
.confirm-text { margin: 0; color: #374151; line-height: 1.6; }
</style>
