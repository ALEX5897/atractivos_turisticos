<template>
  <div class="section">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="filters.q"
          type="search"
          placeholder="Buscar por nombre o código..."
          class="search-input"
          @input="debouncedFetch"
        />
      </div>

      <button class="btn-create" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nueva Ruta
      </button>
    </div>

    <!-- KPIs y Filtros -->
    <div class="kpis-section">
      <div class="kpis-row">
        <div class="kpi-card">
          <div class="kpi-label">Total de Registros</div>
          <div class="kpi-value">{{ total }}</div>
        </div>
        <div v-if="totalDuracion > 0" class="kpi-card kpi-card-secondary">
          <div class="kpi-label">Duración Promedio</div>
          <div class="kpi-value">{{ totalDuracion }}h</div>
        </div>
      </div>

      <div class="filters-container">
        <div class="filter-group">
          <label class="filter-label">Estado</label>
          <select v-model="filters.estado" class="filter-select" @change="fetchItems">
            <option value="">Todos los estados</option>
            <option v-for="e in cats.filterOptions.estados" :key="e" :value="e">
              {{ e }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Nodo</label>
          <select v-model="filters.nodo" class="filter-select" @change="fetchItems">
            <option value="">Todos los nodos</option>
            <option v-for="n in cats.filterOptions.nodos" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Centralidad</label>
          <select v-model="filters.centralidad" class="filter-select" @change="fetchItems">
            <option value="">Todas las centralidades</option>
            <option v-for="c in cats.filterOptions.centralidades" :key="c" :value="c">
              {{ c }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Modalidad</label>
          <select v-model="filters.modalidad" class="filter-select" @change="fetchItems">
            <option value="">Todas las modalidades</option>
            <option v-for="m in cats.filterOptions.modalidades" :key="m" :value="m">
              {{ m }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filtros Activos -->
      <div v-if="activeFiltersCount > 0" class="active-filters-section">
        <div class="active-filters-list">
          <div v-if="filters.estado" class="filter-chip">
            <span class="chip-label">Estado: <strong>{{ filters.estado }}</strong></span>
            <button class="chip-remove" @click="filters.estado = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
          </div>
          <div v-if="filters.nodo" class="filter-chip">
            <span class="chip-label">Nodo: <strong>{{ filters.nodo }}</strong></span>
            <button class="chip-remove" @click="filters.nodo = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
          </div>
          <div v-if="filters.centralidad" class="filter-chip">
            <span class="chip-label">Centralidad: <strong>{{ filters.centralidad }}</strong></span>
            <button class="chip-remove" @click="filters.centralidad = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
          </div>
          <div v-if="filters.modalidad" class="filter-chip">
            <span class="chip-label">Modalidad: <strong>{{ filters.modalidad }}</strong></span>
            <button class="chip-remove" @click="filters.modalidad = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
          </div>
        </div>
        <button class="btn-clear-all" @click="clearAllFilters">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6m-4-1V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1"/>
          </svg>
          Limpiar Filtros
        </button>
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
      row-key="id_ruta"
      @page-change="onPageChange"
    >
      <template #cell-numero="{ row }">
        {{ padNumber(row.n) }}
      </template>

      <template #cell-estado="{ value }">
        <span class="badge" :class="badgeClass(value)">{{ estadoLabel(value) }}</span>
      </template>

      <template #cell-codigo_qt="{ value }">
        <code class="cell-code">{{ value }}</code>
      </template>

      <template #cell-nombre="{ row }">
        <button class="cell-nombre-btn" @click.stop="openRouteMap(row)">
          <span class="nombre-text">{{ row.nombre }}</span>
        </button>
      </template>

      <template #cell-descripcion="{ value }">
        <span class="cell-text-truncate" :title="value">{{ value || '—' }}</span>
      </template>

      <template #cell-dificultad="{ value }">
        <span class="badge" :class="dificultadClass(value)">{{ dificultadLabel(value) }}</span>
      </template>

      <template #actions="{ row }">
        <div class="action-btns">
          <button class="btn-icon btn-view" title="Ver detalle" @click="openView(row)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="btn-icon btn-edit" title="Editar" @click="openEdit(row)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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

    <!-- Mapa de Ruta -->
    <div v-if="selectedRoute" class="route-map-card">
      <div class="route-map-head">
        <div>
          <h4 class="route-map-title">{{ selectedRoute.nombre }}</h4>
          <p class="route-map-sub" v-if="selectedRoute.tipo_ruta">{{ selectedRoute.tipo_ruta }}</p>
        </div>
        <button class="btn-close" @click="closeRouteMap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div ref="routeMapEl" class="route-map-box"></div>
    </div>

    <!-- Modal Crear / Editar -->
    <AppModal
      v-model="showModal"
      :title="editingItem ? `Editar Ruta - ${editingItem.nombre}` : 'Nueva Ruta'"
      size="xl"
      :loading="saving"
      :error="modalError"
      @save="handleSave"
    >
      <div class="modal-tabs">
        <div class="tabs-header">
          <button
            v-for="tab in formTabs"
            :key="tab.id"
            :class="['tab-btn', { 'tab-active': activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="form-grid">
          <!-- TAB 1: DATOS GENERALES -->
          <div class="form-section" v-if="activeTab === 'generales'">
            <!-- 1-3. ESTADO, CÓDIGO QT, INICIALES DE RUTA -->
            <div class="grid-3">
              <div class="field">
                <label>Estado <span class="req">*</span></label>
                <select v-model="form.estado" class="f-select">
                  <option value="EN_REVISION">En revisión</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
              <div class="field">
                <label>Código QT</label>
                <input :value="previewCodigoQT" type="text" class="f-input" disabled />
              </div>
              <div class="field">
                <label>Iniciales de Ruta</label>
                <input v-model="form.iniciales_ruta" type="text" placeholder="Ej: MTR" maxlength="3" class="f-input" />
              </div>
            </div>

            <!-- 4-5. NODO, CENTRALIDAD -->
            <div class="grid-2">
              <div class="field">
                <label>Nodo</label>
                <select v-model="form.nodo_codigo" class="f-select">
                  <option value="">Seleccionar nodo...</option>
                  <option v-for="n in formFilterOptions.nodos" :key="n.codigo" :value="typeof n === 'string' ? n : n.codigo">
                    {{ typeof n === 'string' ? n : n.nombre }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Centralidad</label>
                <select v-model="form.centralidad_codigo" class="f-select">
                  <option value="">Seleccionar centralidad...</option>
                  <option v-for="c in formFilterOptions.centralidades" :key="c.codigo" :value="typeof c === 'string' ? c : c.codigo">
                    {{ typeof c === 'string' ? c : c.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 6-8. NOMBRE, CLASIFICACIÓN, MODALIDAD -->
            <div class="grid-3">
              <div class="field">
                <label>Nombre de la Ruta <span class="req">*</span></label>
                <input v-model="form.nombre" type="text" placeholder="Nombre de la ruta" class="f-input" />
              </div>
              <div class="field">
                <label>Clasificación</label>
                <input v-model="form.clasificacion" type="text" placeholder="Ej: Ruta A" class="f-input" />
              </div>
              <div class="field">
                <label>Modalidad</label>
                <select v-model="form.modalidad_codigo" class="f-select">
                  <option value="">Seleccionar modalidad...</option>
                  <option v-for="m in formFilterOptions.modalidades" :key="m.codigo" :value="typeof m === 'string' ? m : m.codigo">
                    {{ typeof m === 'string' ? m : m.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <div class="field">
              <label>Breve Descripción</label>
              <textarea v-model="form.descripcion" rows="3" class="f-textarea" placeholder="Descripción de la ruta..."></textarea>
            </div>
          </div>

          <!-- TAB 2: CARACTERÍSTICAS -->
          <div class="form-section" v-if="activeTab === 'caracteristicas'">
            <div class="grid-3">
              <div class="field">
                <label>Tiempo de Duración (h)</label>
                <input v-model="form.tiempo_de_duracion_de_ruta_horas" type="text" placeholder="Ej: 2.5" class="f-input" />
              </div>
              <div class="field">
                <label>Distancia (km)</label>
                <input v-model="form.distancia_km" type="text" placeholder="Ej: 15" class="f-input" />
              </div>
              <div class="field">
                <label>Altitud (msnm)</label>
                <input v-model="form.altitud_m_s_n_m" type="text" placeholder="Ej: 2850" class="f-input" />
              </div>
            </div>

            <div class="grid-2">
              <div class="field">
                <label>Dificultad</label>
                <select v-model="form.dificultad" class="f-select">
                  <option value="FACIL">Fácil</option>
                  <option value="MODERADO">Moderado</option>
                  <option value="DIFICIL">Difícil</option>
                  <option value="MUY_DIFICIL">Muy difícil</option>
                </select>
              </div>
              <div class="field">
                <label>Link de Ruta</label>
                <input v-model="form.link_de_ruta" type="url" placeholder="URL de mapa" class="f-input" />
              </div>
            </div>
          </div>

          <!-- TAB 3: ATRACTIVOS / CONTACTO -->
          <div class="form-section" v-if="activeTab === 'atractivos-contacto'">
            <div class="grid-2">
              <div class="field">
                <label>Atractivo 1</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_1" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 2</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_2" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 3</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_3" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 4</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_4" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 5</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_5" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 6</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_6" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 7</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_7" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 8</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_8" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 9</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_9" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Atractivo 10</label>
                <input v-model="form.nombre_del_atractivo_recurso_asociado_a_la_ruta_10" type="text" class="f-input" />
              </div>
            </div>

            <div class="grid-2">
              <div class="field">
                <label>Establecimiento A&B</label>
                <input v-model="form.establecimiento_a_b" type="text" placeholder="Nombre del establecimiento" class="f-input" />
              </div>
              <div class="field">
                <label>Observación de Inactivación</label>
                <input v-model="form.observacion_de_inactivacion" type="text" placeholder="Motivo de inactivación" class="f-input" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>

    <!-- Modal Ver Detalle -->
    <AppModal
      v-model="showViewModal"
      :title="viewingItem ? viewingItem.nombre : 'Detalle de Ruta'"
      size="xl"
      :hide-footer="true"
      :close-on-backdrop="true"
    >
      <div v-if="viewingItem" class="view-grid">

        <!-- Mapa -->
        <div v-if="mapEmbedUrl" class="view-section view-section--map">
          <h4 class="view-section-title">Mapa de Ruta</h4>
          <div class="map-wrapper">
            <iframe
              :src="mapEmbedUrl"
              class="map-iframe"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <a :href="viewingItem.link_de_ruta" target="_blank" rel="noopener noreferrer" class="map-ext-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Abrir en nueva pestaña
            </a>
          </div>
        </div>

        <!-- Identificación -->
        <div class="view-section">
          <h4 class="view-section-title">Identificación</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Código</span><span class="vf-value"><code>{{ viewingItem.codigo }}</code></span></div>
            <div class="view-field"><span class="vf-label">Nombre</span><span class="vf-value">{{ viewingItem.nombre }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Descripción</span><span class="vf-value">{{ viewingItem.descripcion || '—' }}</span></div>
          </div>
        </div>

        <!-- Datos Matriz -->
        <div class="view-section">
          <h4 class="view-section-title">Datos de Matriz</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">N°</span><span class="vf-value">{{ padNumber(viewingItem.n) || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Código QT</span><span class="vf-value">{{ viewingItem.codigo_qt || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Clasificación</span><span class="vf-value">{{ viewingItem.clasificacion || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Nodo</span><span class="vf-value">{{ viewingItem.nodo || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Centralidad</span><span class="vf-value">{{ viewingItem.centralidad || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Modalidad</span><span class="vf-value">{{ viewingItem.modalidad || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Tiempo duración</span><span class="vf-value">{{ viewingItem.tiempo_de_duracion_de_ruta_horas || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Altitud (m.s.n.m)</span><span class="vf-value">{{ viewingItem.altitud_m_s_n_m || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Establecimiento A&amp;B</span><span class="vf-value">{{ viewingItem.establecimiento_a_b || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Obs. inactivación</span><span class="vf-value">{{ viewingItem.observacion_de_inactivacion || '—' }}</span></div>
          </div>
        </div>

        <!-- Contacto y Ubicación -->
        <div class="view-section">
          <h4 class="view-section-title">Contacto y Ubicación</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Teléfono de contacto</span><span class="vf-value">{{ viewingItem.contacto_telefono || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Correo electrónico</span><span class="vf-value">{{ viewingItem.contacto_correo_electronico || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">DPA Manzana/Localidad</span><span class="vf-value">{{ viewingItem.dpa_manzana_localidad_atractivo || '—' }}</span></div>
          </div>
        </div>

        <!-- Atractivos asociados -->
        <div class="view-section">
          <h4 class="view-section-title">Atractivos Asociados</h4>
          <div class="view-fields">
            <template v-for="i in 10" :key="i">
              <div v-if="viewingItem[`nombre_del_atractivo_recurso_asociado_a_la_ruta_${i}`]" class="view-field">
                <span class="vf-label">Atractivo {{ i }}</span>
                <span class="vf-value">{{ viewingItem[`nombre_del_atractivo_recurso_asociado_a_la_ruta_${i}`] }}</span>
              </div>
            </template>
            <div v-if="!hasAtractivos" class="view-field view-field--full"><span class="vf-value vf-empty">Sin atractivos registrados</span></div>
          </div>
        </div>

        <!-- Características -->
        <div class="view-section">
          <h4 class="view-section-title">Características</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Dificultad</span><span class="vf-value"><span class="badge" :class="dificultadClass(viewingItem.dificultad)">{{ dificultadLabel(viewingItem.dificultad) }}</span></span></div>
            <div class="view-field"><span class="vf-label">Distancia (km)</span><span class="vf-value">{{ viewingItem.distancia_km || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Estado</span><span class="vf-value"><span class="badge" :class="badgeClass(viewingItem.estado)">{{ estadoLabel(viewingItem.estado) }}</span></span></div>
          </div>
        </div>

      </div>
    </AppModal>

    <!-- Modal Eliminar -->
    <AppModal
      v-model="showDeleteModal"
      title="Eliminar Ruta"
      size="sm"
      :loading="deleting"
      :error="deleteError"
      save-label="Eliminar"
      :danger="true"
      @save="confirmDelete"
    >
      <p class="confirm-text">
        ¿Está seguro que desea eliminar la ruta
        <strong>{{ deleteTarget?.nombre }}</strong>?
        Esta acción no se puede deshacer.
      </p>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import AppTable from '@/components/AppTable.vue'
import AppModal from '@/components/AppModal.vue'
import MapPicker from '@/components/MapPicker.vue'
import { rutasService } from '@/services/rutas'
import { catalogosService } from '@/services/catalogos'
import { catalogosAdminService } from '@/services/catalogosAdmin'

// Función para formatear números con padding de 3 dígitos (001, 002, 003...)
const padNumber = (num) => {
  if (!num) return '—'
  return String(num).padStart(3, '0')
}

// Helper: Obtener nombre desde código
function getNombreFromCodigo(codigo, catalogArray) {
  if (!codigo || !catalogArray) return null
  const item = catalogArray.find(cat => {
    if (typeof cat === 'string') return false
    return cat.codigo === codigo
  })
  return item?.nombre || null
}

// Helper: Obtener código desde nombre (para editar)
function getCodigoFromNombre(nombre, catalogArray) {
  if (!nombre || !catalogArray) return ''
  const item = catalogArray.find(cat => {
    if (typeof cat === 'string') return cat === nombre
    return cat.nombre === nombre
  })
  return (typeof item === 'string' ? item : item?.codigo) || ''
}

const items = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingItem = ref(null)
const deleteTarget = ref(null)
const showViewModal = ref(false)
const viewingItem = ref(null)
const modalError = ref('')
const deleteError = ref('')
const activeTab = ref('generales')

const formTabs = [
  { id: 'generales', label: 'Datos Generales' },
  { id: 'caracteristicas', label: 'Características' },
  { id: 'atractivos-contacto', label: 'Atractivos/Contacto' },
]

const selectedRoute = ref(null)
const routeMapEl = ref(null)
let routeLeafletMap = null

const cats = reactive({
  tiposRuta: [],
  parroquias: [],
  filterOptions: {
    tiposRuta: [],
    dificultades: [],
    nodos: [],
    centralidades: [],
    modalidades: []
  }
})
const formFilterOptions = reactive({
  nodos: [],
  centralidades: [],
  modalidades: []
})
const kpiCounts = reactive({ total: 0, activo: 0, inactivo: 0, en_revision: 0 })
const filters = reactive({ q: '', estado: '', nodo: '', centralidad: '', modalidad: '', page: 1, limit: 15 })

const columns = [
  { key: 'numero', label: 'N°', width: '50px' },
  { key: 'estado', label: 'Estado', width: '100px' },
  { key: 'codigo_qt', label: 'Código QT', width: '100px' },
  { key: 'nodo', label: 'Nodo', width: '100px' },
  { key: 'centralidad', label: 'Centralidad', width: '110px' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'tiempo_de_duracion_de_ruta_horas', label: 'Duración (h)', width: '90px' },
  { key: 'distancia_km', label: 'Distancia (km)', width: '100px' },
  { key: 'altitud_m_s_n_m', label: 'Altitud (msnm)', width: '100px' },
  { key: 'dificultad', label: 'Dificultad', width: '100px' },
]

const emptyForm = () => ({
  estado: 'EN_REVISION', nombre: '', iniciales_ruta: '', nodo: '', centralidad: '', clasificacion: '', modalidad: '',
  nodo_codigo: '', centralidad_codigo: '', modalidad_codigo: '',
  descripcion: '', tiempo_de_duracion_de_ruta_horas: '', distancia_km: '',
  dificultad: 'FACIL', altitud_m_s_n_m: '', link_de_ruta: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_1: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_2: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_3: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_4: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_5: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_6: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_7: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_8: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_9: '',
  nombre_del_atractivo_recurso_asociado_a_la_ruta_10: '',
  establecimiento_a_b: '', observacion_de_inactivacion: '',
})

const form = reactive(emptyForm())

const zonas = computed(() => {
  const zonesFromItems = items.value
    .map(r => r.zona)
    .filter(Boolean)
  return [...new Set(zonesFromItems)].sort()
})

const totalDuracion = computed(() => {
  return items.value.reduce((sum, r) => {
    const hours = parseFloat(r.tiempo_de_duracion_de_ruta_horas) || 0
    return sum + hours
  }, 0).toFixed(1)
})

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await rutasService.getAll({
      page: filters.page, limit: filters.limit,
      q: filters.q, estado: filters.estado,
      nodo: filters.nodo, centralidad: filters.centralidad,
      modalidad: filters.modalidad,
    })
    items.value = data.data
    total.value = data.total
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

async function fetchKpis() {
  try {
    const [t, a, i, r] = await Promise.all([
      rutasService.getAll({ limit: 1 }),
      rutasService.getAll({ limit: 1, estado: 'ACTIVO' }),
      rutasService.getAll({ limit: 1, estado: 'INACTIVO' }),
      rutasService.getAll({ limit: 1, estado: 'EN_REVISION' }),
    ])
    kpiCounts.total = t.data.total ?? 0
    kpiCounts.activo = a.data.total ?? 0
    kpiCounts.inactivo = i.data.total ?? 0
    kpiCounts.en_revision = r.data.total ?? 0
  } catch (e) {
    console.error('KPI fetch error:', e)
  }
}

function applyEstadoKpi(estado) {
  filters.estado = estado
  filters.page = 1
  fetchItems()
}

async function fetchCatalogs() {
  const [tr, par] = await Promise.all([
    catalogosService.getTiposRuta(),
    catalogosService.getParroquias(),
  ])
  cats.tiposRuta = tr.data.data
  cats.parroquias = par.data.data
}

async function fetchFilterOptions() {
  try {
    const { data } = await rutasService.getFilterOptions({
      estado: filters.estado,
      nodo: filters.nodo,
      centralidad: filters.centralidad,
      modalidad: filters.modalidad,
    })
    cats.filterOptions = data
  } catch (err) {
    console.error('Error fetching filter options:', err)
  }
}

let debounceTimer
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { filters.page = 1; fetchItems() }, 350)
}

function onPageChange(p) { filters.page = p; fetchItems() }

const mapEmbedUrl = computed(() => {
  const url = viewingItem.value?.link_de_ruta
  if (!url) return null
  try {
    const parsed = new URL(url)
    const mid = parsed.searchParams.get('mid')
    if (mid && parsed.hostname === 'www.google.com' && parsed.pathname.startsWith('/maps/d/')) {
      return `https://www.google.com/maps/d/embed?mid=${mid}`
    }
  } catch { /* URL inválida, usar tal cual */ }
  return url
})

const hasAtractivos = computed(() => {
  if (!viewingItem.value) return false
  for (let i = 1; i <= 10; i++) {
    if (viewingItem.value[`nombre_del_atractivo_recurso_asociado_a_la_ruta_${i}`]) return true
  }
  return false
})

const previewCodigoQT = computed(() => {
  if (editingItem.value) {
    return editingItem.value.codigo_qt || '—'
  }
  const nodo = form.nodo_codigo || '—'
  const iniciales = (form.iniciales_ruta || '').toUpperCase() || '—'
  const centralidad = form.centralidad_codigo || '—'
  return `${nodo}${iniciales}${centralidad}NNN`
})

async function openView(row) {
  try {
    const { data } = await rutasService.getById(row.id_ruta)
    viewingItem.value = data.data || row
  } catch {
    viewingItem.value = row
  }
  showViewModal.value = true
}

async function openCreate() {
  Object.assign(form, emptyForm())
  editingItem.value = null
  modalError.value = ''
  activeTab.value = 'generales'
  // Cargar opciones de catálogos para el formulario
  try {
    const [nodos, centralidades, modalidades] = await Promise.all([
      catalogosAdminService.getAll('nodo', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('centralidad', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('modalidad', { page: 1, limit: 500 }),
    ])
    // Mapear los campos al formato esperado
    formFilterOptions.nodos = (nodos.data.data || []).map(n => ({ codigo: n.cod_nodo, nombre: n.nodo_descrp }))
    formFilterOptions.centralidades = (centralidades.data.data || []).map(c => ({ codigo: c.cod_centralidad, nombre: c.centralidad_descrip }))
    formFilterOptions.modalidades = (modalidades.data.data || []).map(m => ({ codigo: m.cod_modalidad, nombre: m.modalidad_descrip }))
  } catch (err) {
    console.error('Error loading catalogs:', err)
  }
  showModal.value = true
}

async function openEdit(row) {
  modalError.value = ''
  activeTab.value = 'generales'
  try {
    // Cargar catálogos para el formulario
    const [nodos, centralidades, modalidades, rutaData] = await Promise.all([
      catalogosAdminService.getAll('nodo', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('centralidad', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('modalidad', { page: 1, limit: 500 }),
      rutasService.getById(row.id_ruta),
    ])
    // Mapear los campos al formato esperado
    formFilterOptions.nodos = (nodos.data.data || []).map(n => ({ codigo: n.cod_nodo, nombre: n.nodo_descrp }))
    formFilterOptions.centralidades = (centralidades.data.data || []).map(c => ({ codigo: c.cod_centralidad, nombre: c.centralidad_descrip }))
    formFilterOptions.modalidades = (modalidades.data.data || []).map(m => ({ codigo: m.cod_modalidad, nombre: m.modalidad_descrip }))

    const payload = rutaData.data.data || row
    Object.assign(form, { ...emptyForm(), ...payload })

    // Populate codigo fields based on stored names
    form.nodo_codigo = getCodigoFromNombre(payload.nodo, formFilterOptions.nodos)
    form.centralidad_codigo = getCodigoFromNombre(payload.centralidad, formFilterOptions.centralidades)
    form.modalidad_codigo = getCodigoFromNombre(payload.modalidad, formFilterOptions.modalidades)

    editingItem.value = row
    showModal.value = true
    await nextTick()
  } catch (err) {
    modalError.value = err.response?.data?.error || 'Error al cargar la ruta'
  }
}

function openDelete(row) {
  deleteTarget.value = row
  deleteError.value = ''
  showDeleteModal.value = true
}

async function handleSave() {
  if (!form.estado || !form.nombre) {
    modalError.value = 'Estado y nombre son obligatorios.'
    return
  }
  modalError.value = ''
  saving.value = true
  try {
    const dataToSend = { ...form }

    // Send codes directly
    dataToSend.nodo_codigo = form.nodo_codigo || null
    dataToSend.centralidad_codigo = form.centralidad_codigo || null
    dataToSend.modalidad_codigo = form.modalidad_codigo || null

    // Also send names for compatibility
    dataToSend.nodo = getNombreFromCodigo(form.nodo_codigo, formFilterOptions.nodos) || null
    dataToSend.centralidad = getNombreFromCodigo(form.centralidad_codigo, formFilterOptions.centralidades) || null
    dataToSend.modalidad = getNombreFromCodigo(form.modalidad_codigo, formFilterOptions.modalidades) || null

    if (editingItem.value) {
      await rutasService.update(editingItem.value.id_ruta, dataToSend)
    } else {
      await rutasService.create(dataToSend)
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
    await rutasService.remove(deleteTarget.value.id_ruta)
    showDeleteModal.value = false
    fetchItems()
  } catch (err) {
    deleteError.value = err.response?.data?.error || 'Error al eliminar'
  } finally {
    deleting.value = false
  }
}

function badgeClass(e) {
  return { ACTIVO: 'badge-success', INACTIVO: 'badge-gray', EN_REVISION: 'badge-warning' }[e] || 'badge-gray'
}

function estadoLabel(e) {
  return { ACTIVO: 'Activo', INACTIVO: 'Inactivo', EN_REVISION: 'En revisión' }[e] || e
}

function dificultadClass(d) {
  return { FACIL: 'badge-success', MODERADO: 'badge-info', DIFICIL: 'badge-warning', MUY_DIFICIL: 'badge-danger' }[d] || 'badge-gray'
}

function dificultadLabel(d) {
  return { FACIL: 'Fácil', MODERADO: 'Moderado', DIFICIL: 'Difícil', MUY_DIFICIL: 'Muy difícil' }[d] || d
}

async function openRouteMap(row) {
  selectedRoute.value = row
  await new Promise(r => setTimeout(r, 50))
  initRouteMap(row)
}

function closeRouteMap() {
  if (routeLeafletMap) {
    routeLeafletMap.remove()
    routeLeafletMap = null
  }
  selectedRoute.value = null
}

async function loadLeaflet() {
  if (window.L) return true
  if (!document.getElementById('leaflet-css-route')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css-route'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
  return new Promise((resolve) => {
    if (document.getElementById('leaflet-js-route')) {
      document.getElementById('leaflet-js-route').addEventListener('load', () => resolve(true))
      return
    }
    const s = document.createElement('script')
    s.id = 'leaflet-js-route'
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.head.appendChild(s)
  })
}

function initRouteMap(ruta) {
  if (!routeMapEl.value) return
  if (routeLeafletMap) { routeLeafletMap.remove(); routeLeafletMap = null }

  const L = window.L
  if (!L) return

  const hasStart = ruta.punto_inicio_lat && ruta.punto_inicio_lng
  const hasEnd = ruta.punto_fin_lat && ruta.punto_fin_lng
  const center = hasStart
    ? [+ruta.punto_inicio_lat, +ruta.punto_inicio_lng]
    : [-0.18, -78.47]

  routeLeafletMap = L.map(routeMapEl.value).setView(center, 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(routeLeafletMap)

  if (hasStart) {
    L.marker([+ruta.punto_inicio_lat, +ruta.punto_inicio_lng])
      .bindTooltip(`Inicio: ${ruta.punto_inicio_nombre || 'Sin nombre'}`, { sticky: true, className: 'lf-tooltip' })
      .addTo(routeLeafletMap)
  }

  if (hasEnd) {
    L.marker([+ruta.punto_fin_lat, +ruta.punto_fin_lng])
      .bindTooltip(`Fin: ${ruta.punto_fin_nombre || 'Sin nombre'}`, { sticky: true, className: 'lf-tooltip' })
      .addTo(routeLeafletMap)
  }

  if (hasStart && hasEnd) {
    L.polyline([
      [+ruta.punto_inicio_lat, +ruta.punto_inicio_lng],
      [+ruta.punto_fin_lat, +ruta.punto_fin_lng]
    ], { color: '#d97706', weight: 3, opacity: 0.7 }).addTo(routeLeafletMap)
  }
}

const activeFiltersCount = computed(() => {
  return [
    filters.estado,
    filters.nodo,
    filters.centralidad,
    filters.modalidad,
  ].filter(Boolean).length
})

function clearAllFilters() {
  filters.estado = ''
  filters.nodo = ''
  filters.centralidad = ''
  filters.modalidad = ''
  filters.page = 1
  fetchFilterOptions()
  fetchItems()
}

onMounted(async () => {
  fetchCatalogs()
  fetchFilterOptions()
  fetchKpis()
  fetchItems()
  await loadLeaflet()
})
watch(() => filters.estado, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.nodo, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.centralidad, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.modalidad, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
</script>

<style scoped>
.section { display: flex; flex-direction: column; gap: 1rem; }

.kpis-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.kpis-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #1a56a0, #2d7dd2);
  color: white;
  border-radius: 10px;
  min-width: 140px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(26, 86, 160, 0.2);
}

.kpi-card-secondary {
  background: linear-gradient(135deg, #059669, #10b981);
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.active-filters-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #dbeafe, #e0f2fe);
  border: 1.5px solid #0ea5e9;
  border-radius: 10px;
}

.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1.5px solid #0ea5e9;
  border-radius: 20px;
  font-size: 0.8125rem;
  color: #0c4a6e;
}

.chip-label {
  font-weight: 500;
}

.chip-label strong {
  color: #0c4a6e;
  font-weight: 700;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 0.25rem;
  background: transparent;
  border: none;
  color: #0ea5e9;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: all 0.15s;
  border-radius: 50%;
}

.chip-remove:hover {
  background: #0ea5e9;
  color: white;
}

.btn-clear-all {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-clear-all:hover {
  background: #dc2626;
}

.btn-clear-all svg {
  width: 16px;
  height: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 0 1 auto;
  min-width: 180px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  cursor: pointer;
  transition: border-color 0.15s;
}

.filter-select:focus {
  outline: none;
  border-color: #1a56a0;
}

.kpi-strip {
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.kpi-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.125rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 80px;
}

.kpi-chip:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.kpi-chip-active {
  border-color: #1a56a0;
  background: linear-gradient(135deg, rgba(26,86,160,0.08), transparent);
  box-shadow: 0 2px 8px rgba(26,86,160,0.15);
}

.kpi-chip-green.kpi-chip-active { border-color: #059669; background: linear-gradient(135deg, rgba(5,150,105,0.08), transparent); box-shadow: 0 2px 8px rgba(5,150,105,0.15); }
.kpi-chip-red.kpi-chip-active { border-color: #dc2626; background: linear-gradient(135deg, rgba(220,38,38,0.08), transparent); box-shadow: 0 2px 8px rgba(220,38,38,0.15); }
.kpi-chip-amber.kpi-chip-active { border-color: #d97706; background: linear-gradient(135deg, rgba(217,119,6,0.08), transparent); box-shadow: 0 2px 8px rgba(217,119,6,0.15); }

.kc-n { font-size: 1.25rem; font-weight: 800; color: #111827; line-height: 1; }
.kc-l { font-size: 0.7rem; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }

.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; min-width: 220px; max-width: 320px; }
.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #374151; background: white; box-sizing: border-box; transition: border-color 0.15s; }
.search-input:focus { outline: none; border-color: #1a56a0; }
.filter-select { padding: 0.5rem 0.75rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #374151; background: white; cursor: pointer; }
.filter-select:focus { outline: none; border-color: #1a56a0; }
.btn-create { display: flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1.125rem; background: linear-gradient(135deg, #1a56a0, #2d7dd2); color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: opacity 0.15s; }
.btn-create:hover { opacity: 0.9; }
.btn-create svg { width: 16px; height: 16px; }
.cell-code { font-family: monospace; font-size: 0.8125rem; color: #4b5563; }
.cell-nombre { display: flex; flex-direction: column; }
.cell-nombre-btn { background: none; border: none; padding: 0; cursor: pointer; text-align: left; }
.cell-nombre-btn:hover { text-decoration: underline; }
.nombre-text { font-weight: 500; color: #111827; }
.nombre-sub { font-size: 0.75rem; color: #9ca3af; }
.cell-metrics { display: flex; flex-direction: column; }
.metric-sub { font-size: 0.75rem; color: #9ca3af; }
.cell-text-truncate { display: block; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.badge { display: inline-block; padding: 0.2rem 0.625rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-success { background: #d1fae5; color: #065f46; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-info    { background: #dbeafe; color: #1e40af; }
.badge-danger  { background: #fee2e2; color: #991b1b; }
.badge-gray    { background: #f3f4f6; color: #6b7280; }
.action-btns { display: flex; align-items: center; justify-content: center; gap: 0.375rem; }
.btn-icon { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer; transition: all 0.15s; }
.btn-icon svg { width: 14px; height: 14px; }
.btn-edit { color: #1a56a0; }
.btn-edit:hover { background: #dbeafe; border-color: #1a56a0; }
.btn-delete { color: #dc2626; }
.btn-delete:hover { background: #fee2e2; border-color: #dc2626; }
.form-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.form-section { display: flex; flex-direction: column; gap: 0.75rem; }
.form-section-title { font-size: 0.8125rem; font-weight: 700; color: #1a56a0; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
.grid-1 { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
.grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
.req { color: #ef4444; }
.f-input, .f-select, .f-textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #374151; background: white; box-sizing: border-box; font-family: inherit; transition: border-color 0.15s; }
.f-input:focus, .f-select:focus, .f-textarea:focus { outline: none; border-color: #1a56a0; }
.f-textarea { resize: vertical; min-height: 70px; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #374151; cursor: pointer; }
.checkbox-label input { width: 15px; height: 15px; cursor: pointer; }
.confirm-text { margin: 0; color: #374151; line-height: 1.6; }
.btn-view { color: #059669; }
.btn-view:hover { background: #d1fae5; border-color: #059669; }

/* Modal ver detalle */
.view-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.view-section { display: flex; flex-direction: column; gap: 0.75rem; }
.view-section--map { order: -1; }
.view-section-title { font-size: 0.8125rem; font-weight: 700; color: #1a56a0; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
.view-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem 1.25rem; }
.view-field { display: flex; flex-direction: column; gap: 0.125rem; }
.view-field--full { grid-column: 1 / -1; }
.vf-label { font-size: 0.75rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
.vf-value { font-size: 0.875rem; color: #111827; line-height: 1.5; word-break: break-word; }
.vf-empty { color: #9ca3af; font-style: italic; }
.vf-link { color: #1a56a0; text-decoration: underline; word-break: break-all; }
.vf-link:hover { color: #2d7dd2; }
.map-wrapper { position: relative; border-radius: 10px; overflow: hidden; border: 1.5px solid #e5e7eb; }
.map-iframe { width: 100%; height: 400px; border: none; display: block; }
.map-ext-link { display: inline-flex; align-items: center; gap: 0.375rem; position: absolute; bottom: 0.75rem; right: 0.75rem; padding: 0.375rem 0.75rem; background: white; border: 1.5px solid #d1d5db; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #374151; text-decoration: none; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.map-ext-link:hover { background: #f9fafb; border-color: #1a56a0; color: #1a56a0; }
.map-ext-link svg { width: 13px; height: 13px; }

.cell-nombre-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  text-align: left;
  transition: opacity 0.15s;
}

.cell-nombre-btn:hover {
  opacity: 0.7;
}

/* Route Map */
.route-map-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

.route-map-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.route-map-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.125rem;
}

.route-map-sub {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.btn-close:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.btn-close svg {
  width: 16px;
  height: 16px;
}

.route-map-box {
  height: 400px;
  background: #f0f4f8;
}

/* Code Preview */
.code-preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.code-preview-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.code-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.code-value {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 4px;
  word-break: break-all;
}

@media (max-width: 768px) {
  .code-preview-container {
    grid-template-columns: 1fr;
  }
}

/* Modal Tabs */
.modal-tabs {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tabs-header {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  margin: -1.25rem -1.5rem 1.25rem -1.5rem;
  padding: 0 1.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  background: #f9fafb;
}

.tab-btn {
  padding: 0.875rem 1.25rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  font-family: inherit;
}

.tab-btn:hover {
  color: #374151;
  background: rgba(26, 86, 160, 0.04);
}

.tab-btn.tab-active {
  color: #1a56a0;
  border-bottom-color: #1a56a0;
  background: white;
  font-weight: 600;
}

@media (max-width: 640px) {
  .tabs-header {
    padding: 0 1rem;
    margin: -1.25rem -1rem 1.25rem -1rem;
  }

  .tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }
}

/* Form */
.form-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.form-section { display: flex; flex-direction: column; gap: 0.75rem; }
.form-section-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #1a56a0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.grid-1 { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }

.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
.req { color: #ef4444; }

.f-input, .f-select, .f-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.15s;
}

.f-input:focus, .f-select:focus, .f-textarea:focus {
  outline: none;
  border-color: #1a56a0;
}

.f-textarea { resize: vertical; min-height: 70px; }
.f-input:disabled, .f-select:disabled {
  background: white;
  color: #374151;
  cursor: default;
  border-color: #d1d5db;
}
</style>
