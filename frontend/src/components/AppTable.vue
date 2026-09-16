<template>
  <div class="app-table-wrapper">
    <!-- Loading overlay -->
    <div v-if="loading" class="table-loading">
      <div class="spinner-ring"></div>
      <span>Cargando...</span>
    </div>

    <div v-else>
      <div class="table-scroll">
        <table class="app-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : {}">
              {{ col.label }}
            </th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data.length">
            <td :colspan="columns.length + 1" class="empty-cell">
              <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                </svg>
                <span>Sin registros encontrados</span>
              </div>
            </td>
          </tr>
          <tr v-for="row in data" :key="row[rowKey]" class="data-row">
            <td v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
            <td class="td-actions">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="total > 0" class="pagination">
        <div class="pagination-left">
          <span class="pagination-info">
            {{ paginationInfo }}
          </span>
          <div class="limit-selector">
            <label>Mostrar:</label>
            <select :value="limit" @change="$emit('limit-change', parseInt($event.target.value))" class="limit-select">
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div class="pagination-controls">
          <button
            class="page-btn"
            :disabled="page <= 1"
            @click="$emit('page-change', page - 1)"
          >‹</button>
          <span class="page-indicator">{{ page }} / {{ totalPages }}</span>
          <button
            class="page-btn"
            :disabled="page >= totalPages"
            @click="$emit('page-change', page + 1)"
          >›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  limit: { type: Number, default: 15 },
  rowKey: { type: String, default: 'id' },
})

defineEmits(['page-change', 'limit-change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))

const paginationInfo = computed(() => {
  const from = (props.page - 1) * props.limit + 1
  const to = Math.min(props.page * props.limit, props.total)
  return `${from}–${to} de ${props.total} registros`
})
</script>

<style scoped>
.app-table-wrapper {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.app-table-wrapper:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.table-scroll {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: visible;
}

.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.spinner-ring {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #1a56a0;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.app-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  table-layout: auto;
}

.app-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: sticky;
  top: 0;
  z-index: 10;
}

.th-actions {
  width: 120px;
  text-align: center !important;
}

.app-table td {
  padding: 0.875rem 1rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: background-color 0.2s ease;
}

.data-row:last-child td {
  border-bottom: none;
}

.data-row:hover {
  background: linear-gradient(to right, #f8fafc, #f0f4f8);
}

.data-row:hover td {
  background-color: transparent;
}

.td-actions {
  text-align: center;
}

.empty-cell {
  padding: 3rem !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
}

.empty-state svg {
  width: 40px;
  height: 40px;
}

.empty-state span {
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.pagination-info {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.limit-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.limit-selector label {
  font-weight: 600;
}

.limit-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  font-size: 0.8125rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.limit-select:hover {
  border-color: #94a3b8;
}

.limit-select:focus {
  outline: none;
  border-color: #003f87;
  box-shadow: 0 0 0 3px rgba(0, 63, 135, 0.1);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  color: #475569;
  transition: all 0.2s ease;
  font-weight: 600;
}

.page-btn:hover:not(:disabled) {
  border-color: #003f87;
  color: #003f87;
  background: #f0f4f8;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8fafc;
}

.page-indicator {
  font-size: 0.8125rem;
  color: #475569;
  min-width: 70px;
  text-align: center;
  font-weight: 500;
}
</style>
