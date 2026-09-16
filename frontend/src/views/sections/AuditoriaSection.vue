<template>
  <div class="section">
    <!-- Toolbar con Filtros -->
    <div class="toolbar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="filters.tabla"
          type="text"
          placeholder="Filtrar por tabla..."
          class="search-input"
          @change="fetchItems"
        />
      </div>
    </div>

    <!-- Filtros Avanzados -->
    <div class="filters-container">
      <div class="filter-group">
        <label class="filter-label">Tipo de Acción</label>
        <select v-model="filters.tipo_accion" class="filter-select" @change="fetchItems">
          <option value="">Todas las acciones</option>
          <option value="CREATE">Creación</option>
          <option value="UPDATE">Edición</option>
          <option value="DELETE">Eliminación</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Desde (Fecha)</label>
        <input v-model="filters.fecha_desde" type="date" class="filter-input" @change="fetchItems" />
      </div>

      <div class="filter-group">
        <label class="filter-label">Hasta (Fecha)</label>
        <input v-model="filters.fecha_hasta" type="date" class="filter-input" @change="fetchItems" />
      </div>
    </div>

    <!-- Tabla de Auditoría -->
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
      <template #cell-tipo_accion="{ value }">
        <span class="badge" :class="getBadgeClass(value)">
          {{ getBadgeLabel(value) }}
        </span>
      </template>

      <template #cell-fecha_hora="{ value }">
        {{ formatearFecha(value) }}
      </template>

      <template #actions="{ row }">
        <div class="action-btns">
          <button class="btn-icon btn-detail" title="Ver detalles" @click="openDetail(row)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </template>
    </AppTable>

    <!-- Modal de Detalles -->
    <AppModal
      v-if="selectedItem"
      v-model="showDetail"
      :title="`Detalles del Cambio #${selectedItem.id}`"
      size="lg"
      confirm-only
      @save="showDetail = false"
    >
      <div class="detail-content">
        <div class="detail-header">
          <div class="detail-row">
            <span class="detail-label">Tabla:</span>
            <span class="detail-value">{{ selectedItem.tabla_afectada }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Registro ID:</span>
            <span class="detail-value">{{ selectedItem.registro_id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Usuario:</span>
            <span class="detail-value">{{ selectedItem.usuario_nombre }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fecha/Hora:</span>
            <span class="detail-value">{{ formatearFecha(selectedItem.fecha_hora) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Descripción:</span>
            <span class="detail-value">{{ selectedItem.descripcion }}</span>
          </div>
        </div>

        <!-- Cambios Realizados (solo para UPDATE) -->
        <div v-if="selectedItem.tipo_accion === 'UPDATE' && cambiosParseados.length > 0" class="cambios-section">
          <h4 class="cambios-title">Cambios Realizados</h4>
          <table class="cambios-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Valor Anterior</th>
                <th>Valor Nuevo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cambio in cambiosParseados" :key="cambio.campo">
                <td class="campo-name">{{ cambio.campo }}</td>
                <td class="valor-anterior">{{ cambio.valor_anterior || '(vacío)' }}</td>
                <td class="valor-nuevo">{{ cambio.valor_nuevo || '(vacío)' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Datos Completos (para referencia) -->
        <div v-if="selectedItem.tipo_accion === 'UPDATE' && datosAnterioresParsados" class="datos-section">
          <h4 class="datos-title">Datos Anteriores Completos</h4>
          <div class="json-display">
            <pre>{{ JSON.stringify(datosAnterioresParsados, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppTable from '@/components/AppTable.vue'
import AppModal from '@/components/AppModal.vue'
import { auditoriaService } from '@/services/auditoria'

const items = ref([])
const loading = ref(false)
const total = ref(0)
const showDetail = ref(false)
const selectedItem = ref(null)

const columns = [
  { key: 'fecha_hora', label: 'Fecha y Hora' },
  { key: 'tabla_afectada', label: 'Tabla' },
  { key: 'registro_id', label: 'ID Registro' },
  { key: 'tipo_accion', label: 'Acción' },
  { key: 'usuario_nombre', label: 'Usuario' },
  { key: 'descripcion', label: 'Descripción' },
]

const filters = ref({
  tabla: '',
  tipo_accion: '',
  fecha_desde: '',
  fecha_hasta: '',
  page: 1,
  limit: 15,
})

const cambiosParseados = computed(() => {
  if (!selectedItem.value?.cambios_campo) return []
  try {
    return typeof selectedItem.value.cambios_campo === 'string'
      ? JSON.parse(selectedItem.value.cambios_campo)
      : selectedItem.value.cambios_campo
  } catch {
    return []
  }
})

const datosAnterioresParsados = computed(() => {
  if (!selectedItem.value?.datos_anteriores) return null
  try {
    return typeof selectedItem.value.datos_anteriores === 'string'
      ? JSON.parse(selectedItem.value.datos_anteriores)
      : selectedItem.value.datos_anteriores
  } catch {
    return null
  }
})

function getBadgeClass(tipo_accion) {
  const clases = {
    CREATE: 'badge-create',
    UPDATE: 'badge-update',
    DELETE: 'badge-delete',
  }
  return clases[tipo_accion] || 'badge-default'
}

function getBadgeLabel(tipo_accion) {
  const labels = {
    CREATE: '✨ Creación',
    UPDATE: '✏️ Edición',
    DELETE: '🗑️ Eliminación',
  }
  return labels[tipo_accion] || tipo_accion
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function openDetail(row) {
  selectedItem.value = row
  showDetail.value = true
}

async function fetchItems() {
  loading.value = true
  try {
    const params = {
      page: filters.value.page,
      limit: filters.value.limit,
    }
    if (filters.value.tabla) params.tabla = filters.value.tabla
    if (filters.value.tipo_accion) params.tipo_accion = filters.value.tipo_accion
    if (filters.value.fecha_desde) params.fecha_desde = filters.value.fecha_desde
    if (filters.value.fecha_hasta) params.fecha_hasta = filters.value.fecha_hasta

    const { data } = await auditoriaService.getAll(params)
    items.value = data.data
    total.value = data.total
  } catch (err) {
    console.error('Error fetching auditoría:', err)
    alert('Error al obtener auditoría')
  } finally {
    loading.value = false
  }
}

function onPageChange(newPage) {
  filters.value.page = newPage
  fetchItems()
}

onMounted(() => {
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

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 0.875rem 0.625rem 2.5rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.search-input:focus {
  outline: none;
  border-color: #1a56a0;
  box-shadow: 0 0 0 3px rgba(26, 86, 160, 0.1);
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  background: white;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  padding: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 0.625rem 0.875rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #1a56a0;
  box-shadow: 0 0 0 3px rgba(26, 86, 160, 0.1);
}

.badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: none;
}

.badge-create {
  background: #dcfce7;
  color: #166534;
}

.badge-update {
  background: #bfdbfe;
  color: #1e40af;
}

.badge-delete {
  background: #fecaca;
  color: #991b1b;
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

.btn-detail {
  color: #8b5cf6;
}

.btn-detail:hover {
  background-color: rgba(139, 92, 246, 0.1);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
}

.detail-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: start;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.detail-value {
  color: #1f2937;
  font-size: 0.875rem;
  word-break: break-word;
}

.cambios-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cambios-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.cambios-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.cambios-table thead {
  background: #f9fafb;
}

.cambios-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.cambios-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.cambios-table tbody tr:hover {
  background: #f9fafb;
}

.campo-name {
  font-weight: 500;
  color: #1f2937;
}

.valor-anterior {
  color: #991b1b;
  background: #fef2f2;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
}

.valor-nuevo {
  color: #166534;
  background: #f0fdf4;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
}

.datos-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.datos-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.json-display {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

.json-display pre {
  margin: 0;
  font-size: 0.75rem;
  font-family: 'Monaco', 'Courier New', monospace;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
