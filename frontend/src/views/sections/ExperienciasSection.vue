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
          placeholder="Buscar por nombre, código u operador..."
          class="search-input"
          @input="debouncedFetch"
        />
      </div>

      <button class="btn-create" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nueva Experiencia
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
          <div class="kpi-label">Duración Total</div>
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
          <label class="filter-label">Parroquia</label>
          <select v-model="filters.parroquia" class="filter-select" @change="fetchItems">
            <option value="">Todas las parroquias</option>
            <option v-for="p in cats.filterOptions.parroquias" :key="p" :value="p">
              {{ p }}
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
          <div v-if="filters.parroquia" class="filter-chip">
            <span class="chip-label">Parroquia: <strong>{{ filters.parroquia }}</strong></span>
            <button class="chip-remove" @click="filters.parroquia = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
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
      row-key="id_experiencia"
      @page-change="onPageChange"
      @limit-change="onLimitChange"
    >
      <template #cell-codigo="{ value }">
        <code class="cell-code">{{ value }}</code>
      </template>

      <template #cell-numero="{ row }">
        {{ padNumber(row.n) }}
      </template>

      <template #cell-estado_experiencia="{ value }">
        <span class="badge" :class="badgeClass(value)">{{ estadoLabel(value) }}</span>
      </template>

      <template #cell-costo="{ value }">
        <span v-if="value">${{ value }}</span>
        <span v-else class="text-muted">-</span>
      </template>

      <template #cell-tiempo_de_duracion="{ value }">
        <span v-if="value">{{ value }}</span>
        <span v-else class="text-muted">-</span>
      </template>

      <template #cell-contactos="{ value }">
        <span v-if="value && value.length > 20" :title="value">{{ value.substring(0, 20) }}...</span>
        <span v-else-if="value">{{ value }}</span>
        <span v-else class="text-muted">-</span>
      </template>

      <template #cell-centralidad="{ value }">
        <span v-if="value">{{ value }}</span>
        <span v-else class="text-muted">-</span>
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

    <!-- Modal Crear / Editar -->
    <AppModal
      v-model="showModal"
      :title="editingItem ? `Editar Experiencia - ${editingItem.nombre_de_la_experiencia}` : 'Nueva Experiencia'"
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
            <!-- 1-3: ESTADO, CÓDIGO QT, PARROQUIA -->
            <div class="grid-3">
              <div class="field">
                <label>Estado <span class="req">*</span></label>
                <select v-model="form.estado_experiencia" class="f-select">
                  <option value="EN_REVISION">En revisión</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
              <div class="field">
                <label>Código QT</label>
                <input :value="codigoPreview || '——————————————'" type="text" class="f-input" disabled />
              </div>
              <div class="field">
                <label>Parroquia</label>
                <select v-model="form.parroquia_codigo" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="(p, idx) in cats.filterOptions.parroquias" :key="`parr-${idx}`" :value="typeof p === 'string' ? p : p.codigo">
                    {{ typeof p === 'string' ? p : p.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- NODO, CENTRALIDAD, MODALIDAD -->
            <div class="grid-3">
              <div class="field">
                <label>Nodo</label>
                <select v-model="form.nodo_codigo" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="(n, idx) in formFilterOptions.nodos" :key="`nodo-${idx}`" :value="typeof n === 'string' ? n : n.codigo">
                    {{ typeof n === 'string' ? n : n.nombre }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Centralidad</label>
                <select v-model="form.centralidad_codigo" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="(c, idx) in formFilterOptions.centralidades" :key="`central-${idx}`" :value="typeof c === 'string' ? c : c.codigo">
                    {{ typeof c === 'string' ? c : c.nombre }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Modalidad</label>
                <select v-model="form.modalidad_codigo" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="(m, idx) in formFilterOptions.modalidades" :key="`modal-${idx}`" :value="typeof m === 'string' ? m : m.codigo">
                    {{ typeof m === 'string' ? m : m.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- NOMBRE DE LA EXPERIENCIA -->
            <div class="grid-1">
              <div class="field">
                <label>Nombre de la Experiencia <span class="req">*</span></label>
                <input v-model="form.nombre_de_la_experiencia" type="text" placeholder="Nombre de la experiencia" class="f-input" />
              </div>
            </div>
          </div>

          <!-- TAB 2: UBICACIÓN -->
          <div class="form-section" v-if="activeTab === 'ubicacion'">
            <!-- DIRECCIÓN -->
            <div class="grid-1">
              <div class="field">
                <label>Dirección</label>
                <input v-model="form.direccion" type="text" class="f-input" placeholder="Dirección completa" />
              </div>
            </div>

            <!-- MAPA -->
            <MapPicker
              :latitude="form.latitud"
              :longitude="form.longitud"
              :is-editing="!!editingItem"
              @update:latitude="form.latitud = $event"
              @update:longitude="form.longitud = $event"
            />

            <!-- BREVE DESCRIPCIÓN Y ACTIVIDADES -->
            <div class="field" style="margin-top: 24px;">
              <label>Breve Descripción y Actividades a Realizar</label>
              <textarea v-model="form.breve_descripcion_y_actividades_a_realizar" rows="3" class="f-textarea" placeholder="Describa las actividades que se realizan..."></textarea>
            </div>
          </div>

          <!-- TAB 3: OPERACIÓN -->
          <div class="form-section" v-if="activeTab === 'operacion'">
            <!-- TIEMPO DE DURACIÓN, HORARIO, COSTO -->
            <div class="grid-3">
              <div class="field">
                <label>Tiempo de Duración</label>
                <input v-model="form.tiempo_de_duracion" type="text" placeholder="Ej: 2 horas" class="f-input" />
              </div>
              <div class="field">
                <label>Horario de Atención</label>
                <input v-model="form.horario_de_atencion" type="text" placeholder="Ej: 08:00 - 17:00" class="f-input" />
              </div>
              <div class="field">
                <label>Costo</label>
                <input v-model="form.costo" type="text" placeholder="Ej: $10" class="f-input" />
              </div>
            </div>

            <!-- CAPACIDAD, RESTRICCIONES -->
            <div class="grid-2">
              <div class="field">
                <label>Capacidad</label>
                <input v-model="form.capacidad" type="text" placeholder="Ej: 20 personas" class="f-input" />
              </div>
              <div class="field">
                <label>Restricciones</label>
                <input v-model="form.restricciones" type="text" placeholder="Ej: No se permiten mascotas" class="f-input" />
              </div>
            </div>

            <!-- CONTACTOS -->
            <div class="field">
              <label>Contactos</label>
              <textarea v-model="form.contactos" rows="2" class="f-textarea" placeholder="Información de contactos..."></textarea>
            </div>
          </div>
        </div>
      </div>
    </AppModal>

    <!-- Modal Ver Detalle -->
    <AppModal
      v-model="showViewModal"
      :title="viewingItem ? viewingItem.nombre : 'Detalle de Experiencia'"
      size="xl"
      :hide-footer="true"
      :close-on-backdrop="true"
    >
      <div v-if="viewingItem" class="view-grid">

        <!-- Identificación -->
        <div class="view-section">
          <h4 class="view-section-title">Identificación</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">N°</span><span class="vf-value">{{ padNumber(viewingItem.n) }}</span></div>
            <div class="view-field"><span class="vf-label">Estado</span><span class="vf-value"><span class="badge" :class="badgeClass(viewingItem.estado_experiencia)">{{ estadoLabel(viewingItem.estado_experiencia) }}</span></span></div>
            <div class="view-field"><span class="vf-label">Código QT</span><span class="vf-value">{{ viewingItem.codigo_experiencia_qt || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Nombre</span><span class="vf-value">{{ viewingItem.nombre_de_la_experiencia }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Breve descripción y actividades</span><span class="vf-value">{{ viewingItem.breve_descripcion_y_actividades_a_realizar || '—' }}</span></div>
          </div>
        </div>

        <!-- Mapa -->
        <div v-if="mapEmbedUrl" class="view-section view-section--map">
          <h4 class="view-section-title">Ubicación en el Mapa</h4>
          <div class="map-wrapper">
            <iframe
              :src="mapEmbedUrl"
              class="map-iframe"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <a
              :href="`https://www.google.com/maps?q=${viewingItem.latitud},${viewingItem.longitud}`"
              target="_blank" rel="noopener noreferrer" class="map-ext-link"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Abrir en Google Maps
            </a>
          </div>
        </div>

        <!-- Ubicación y Clasificación -->
        <div class="view-section">
          <h4 class="view-section-title">Ubicación y Clasificación</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Parroquia</span><span class="vf-value">{{ viewingItem.parroquia || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Nodo</span><span class="vf-value">{{ viewingItem.nodo || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Centralidad</span><span class="vf-value">{{ viewingItem.centralidad || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Modalidad</span><span class="vf-value">{{ viewingItem.modalidad || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Dirección</span><span class="vf-value">{{ viewingItem.direccion || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Latitud</span><span class="vf-value">{{ viewingItem.latitud || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Longitud</span><span class="vf-value">{{ viewingItem.longitud || '—' }}</span></div>
          </div>
        </div>

        <!-- Operación -->
        <div class="view-section">
          <h4 class="view-section-title">Información de Operación</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Tiempo de duración</span><span class="vf-value">{{ viewingItem.tiempo_de_duracion || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Horario de atención</span><span class="vf-value">{{ viewingItem.horario_de_atencion || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Costo</span><span class="vf-value">{{ viewingItem.costo || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Capacidad</span><span class="vf-value">{{ viewingItem.capacidad || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Restricciones</span><span class="vf-value">{{ viewingItem.restricciones || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Contactos</span><span class="vf-value">{{ viewingItem.contactos || '—' }}</span></div>
          </div>
        </div>

      </div>
    </AppModal>

    <!-- Modal Eliminar -->
    <AppModal
      v-model="showDeleteModal"
      title="Eliminar Experiencia"
      size="sm"
      :loading="deleting"
      :error="deleteError"
      save-label="Eliminar"
      :danger="true"
      @save="confirmDelete"
    >
      <p class="confirm-text">
        ¿Está seguro que desea eliminar la experiencia
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
import { experienciasService } from '@/services/experiencias'
import { catalogosService } from '@/services/catalogos'
import { catalogosAdminService } from '@/services/catalogosAdmin'

// Función para formatear números con padding de 3 dígitos (001, 002, 003...)
const padNumber = (num) => {
  if (!num) return '—'
  return String(num).padStart(3, '0')
}

const items = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const showViewModal = ref(false)
const editingItem = ref(null)
const deleteTarget = ref(null)
const viewingItem = ref(null)
const modalError = ref('')
const deleteError = ref('')
const activeTab = ref('generales')

const formTabs = [
  { id: 'generales', label: 'Datos Generales' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'operacion', label: 'Operación' },
]

const cats = reactive({
  tiposExp: [],
  atractivos: [],
  filterOptions: {
    estados: [],
    parroquias: [],
    nodos: [],
    centralidades: [],
    modalidades: []
  }
})
const formFilterOptions = reactive({
  estados: [],
  parroquias: [],
  nodos: [],
  centralidades: [],
  modalidades: []
})
const kpiCounts = reactive({ total: 0, activo: 0, inactivo: 0, en_revision: 0 })
const filters = reactive({ q: '', estado: '', parroquia: '', nodo: '', centralidad: '', modalidad: '', page: 1, limit: 15 })

const columns = [
  { key: 'numero', label: 'N°', width: '70px' },
  { key: 'estado_experiencia', label: 'Estado', width: '100px' },
  { key: 'codigo_experiencia_qt', label: 'Código QT', width: '110px' },
  { key: 'parroquia', label: 'Parroquia', width: '120px' },
  { key: 'nodo', label: 'Nodo', width: '100px' },
  { key: 'centralidad', label: 'Centralidad', width: '110px' },
  { key: 'nombre_de_la_experiencia', label: 'Nombre' },
  { key: 'direccion', label: 'Dirección', width: '140px' },
  { key: 'tiempo_de_duracion', label: 'Duración', width: '90px' },
  { key: 'horario_de_atencion', label: 'Horario', width: '130px' },
  { key: 'costo', label: 'Costo', width: '100px' },
]

const emptyForm = () => ({
  estado_experiencia: 'EN_REVISION',
  codigo_experiencia_qt: '',
  parroquia: '',
  nodo: '',
  centralidad: '',
  modalidad: '',
  parroquia_codigo: '',
  nodo_codigo: '',
  centralidad_codigo: '',
  modalidad_codigo: '',
  nombre_de_la_experiencia: '',
  breve_descripcion_y_actividades_a_realizar: '',
  direccion: '',
  latitud: -0.2191000,
  longitud: -78.5107000,
  tiempo_de_duracion: '',
  horario_de_atencion: '',
  costo: '',
  capacidad: '',
  restricciones: '',
  contactos: '',
  codigo: '',
  nombre: '',
})

// Estado para vista previa del código
const codigoPreview = computed(() => {
  const parroquiaCod = form.parroquia_codigo || '——'
  const modalidadCod = form.modalidad_codigo || '——'
  const nodoCod = form.nodo_codigo || '——'
  const centralidadCod = form.centralidad_codigo || '——'
  const nNum = editingItem.value ? padNumber(editingItem.value.n) : '———'
  return `${parroquiaCod}${modalidadCod}${nodoCod}${centralidadCod}${nNum}`
})

const form = reactive(emptyForm())

const mapEmbedUrl = computed(() => {
  const lat = viewingItem.value?.latitud
  const lng = viewingItem.value?.longitud
  if (!lat || !lng) return null
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
})

const zonas = computed(() => {
  const zonesFromItems = items.value
    .map(e => e.zona)
    .filter(Boolean)
  return [...new Set(zonesFromItems)].sort()
})

const allCentralidades = computed(() => {
  const fromItems = items.value.map(e => e.centralidad).filter(Boolean)
  const result = [...new Set(fromItems)]
  return result.sort()
})

const totalDuracion = computed(() => {
  return items.value.reduce((sum, e) => {
    const hours = parseFloat(e.tiempo_de_duracion) || 0
    return sum + hours
  }, 0).toFixed(1)
})

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await experienciasService.getAll({
      page: filters.page,
      limit: filters.limit,
      q: filters.q,
      estado: filters.estado,
      parroquia: filters.parroquia,
      nodo: filters.nodo,
      centralidad: filters.centralidad,
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
      experienciasService.getAll({ limit: 1 }),
      experienciasService.getAll({ limit: 1, estado_experiencia: 'ACTIVO' }),
      experienciasService.getAll({ limit: 1, estado_experiencia: 'INACTIVO' }),
      experienciasService.getAll({ limit: 1, estado_experiencia: 'EN_REVISION' }),
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
  filters.estado_experiencia = estado
  filters.page = 1
  fetchItems()
}

async function fetchCatalogs() {
  const [te, at, par] = await Promise.all([
    catalogosService.getTiposExperiencia(),
    catalogosService.getAtractivosActivos(),
    catalogosService.getParroquias(),
  ])
  cats.tiposExp = te.data.data
  cats.atractivos = at.data.data
  cats.parroquias = par.data.data
}

async function fetchFilterOptions() {
  try {
    const { data } = await experienciasService.getFilterOptions({
      estado: filters.estado,
      parroquia: filters.parroquia,
      nodo: filters.nodo,
      centralidad: filters.centralidad,
      modalidad: filters.modalidad,
    })
    cats.filterOptions = {
      estados: data.estados || [],
      parroquias: data.parroquias || [],
      nodos: data.nodos || [],
      centralidades: data.centralidades || [],
      modalidades: data.modalidades || []
    }
    console.log('Filter options loaded:', {
      estados: cats.filterOptions.estados.length,
      parroquias: cats.filterOptions.parroquias.length,
      nodos: cats.filterOptions.nodos.length,
      centralidades: cats.filterOptions.centralidades.length,
      modalidades: cats.filterOptions.modalidades.length
    })
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
function onLimitChange(l) { filters.page = 1; filters.limit = l; fetchItems() }

async function openView(row) {
  try {
    const { data } = await experienciasService.getById(row.id_experiencia)
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
    const [parroquias, nodos, centralidades, modalidades] = await Promise.all([
      catalogosAdminService.getAll('parroquia', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('nodo', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('centralidad', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('modalidad', { page: 1, limit: 500 }),
    ])
    // Mapear los campos al formato esperado
    formFilterOptions.parroquias = (parroquias.data.data || []).map(p => ({ codigo: p.cod_dpa, nombre: p.dpa_descrip }))
    formFilterOptions.nodos = (nodos.data.data || []).map(n => ({ codigo: n.cod_nodo, nombre: n.nodo_descrp }))
    formFilterOptions.centralidades = (centralidades.data.data || []).map(c => ({ codigo: c.cod_centralidad, nombre: c.centralidad_descrip }))
    formFilterOptions.modalidades = (modalidades.data.data || []).map(m => ({ codigo: m.cod_modalidad, nombre: m.modalidad_descrip }))
  } catch (err) {
    console.error('Error loading catalogs:', err)
  }
  showModal.value = true
}

// Helper: buscar código por nombre en los catálogos
function getCodigoFromNombre(nombre, catalogArray) {
  if (!nombre || !catalogArray) return ''
  const item = catalogArray.find(cat => {
    if (typeof cat === 'string') return cat === nombre
    return cat.nombre === nombre
  })
  return (typeof item === 'string' ? item : item?.codigo) || ''
}

async function openEdit(row) {
  modalError.value = ''
  activeTab.value = 'generales'
  try {
    // Cargar catálogos para el formulario
    const [parroquias, nodos, centralidades, modalidades, expData] = await Promise.all([
      catalogosAdminService.getAll('parroquia', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('nodo', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('centralidad', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('modalidad', { page: 1, limit: 500 }),
      experienciasService.getById(row.id_experiencia),
    ])
    // Mapear los campos al formato esperado
    formFilterOptions.parroquias = (parroquias.data.data || []).map(p => ({ codigo: p.cod_dpa, nombre: p.dpa_descrip }))
    formFilterOptions.nodos = (nodos.data.data || []).map(n => ({ codigo: n.cod_nodo, nombre: n.nodo_descrp }))
    formFilterOptions.centralidades = (centralidades.data.data || []).map(c => ({ codigo: c.cod_centralidad, nombre: c.centralidad_descrip }))
    formFilterOptions.modalidades = (modalidades.data.data || []).map(m => ({ codigo: m.cod_modalidad, nombre: m.modalidad_descrip }))

    const payload = expData.data.data || row
    Object.assign(form, { ...emptyForm(), ...payload })
    form.latitud = Number(form.latitud) || 0
    form.longitud = Number(form.longitud) || 0

    // Poblar los campos _codigo basándose en los nombres almacenados
    form.parroquia_codigo = getCodigoFromNombre(payload.parroquia, formFilterOptions.parroquias)
    form.nodo_codigo = getCodigoFromNombre(payload.nodo, formFilterOptions.nodos)
    form.centralidad_codigo = getCodigoFromNombre(payload.centralidad, formFilterOptions.centralidades)
    form.modalidad_codigo = getCodigoFromNombre(payload.modalidad, formFilterOptions.modalidades)

    editingItem.value = row
    showModal.value = true
  } catch (err) {
    modalError.value = err.response?.data?.error || 'Error al cargar la experiencia'
  }
}

function openDelete(row) {
  deleteTarget.value = row
  deleteError.value = ''
  showDeleteModal.value = true
}

// Helper: buscar nombre por código en los catálogos
function getNombreFromCodigo(codigo, catalogArray) {
  if (!codigo || !catalogArray) return null
  const item = catalogArray.find(cat => {
    if (typeof cat === 'string') return false
    return cat.codigo === codigo
  })
  return item?.nombre || null
}

async function handleSave() {
  if (!form.nombre_de_la_experiencia) {
    modalError.value = 'Nombre de la experiencia es obligatorio.'
    return
  }
  modalError.value = ''
  saving.value = true
  try {
    // Preparar datos a enviar: incluir tanto códigos como nombres
    const dataToSend = { ...form }

    // Enviar códigos para que el backend use directamente
    dataToSend.parroquia_codigo = form.parroquia_codigo || null
    dataToSend.nodo_codigo = form.nodo_codigo || null
    dataToSend.centralidad_codigo = form.centralidad_codigo || null
    dataToSend.modalidad_codigo = form.modalidad_codigo || null

    // También enviar nombres para compatibilidad y almacenamiento
    dataToSend.parroquia = getNombreFromCodigo(form.parroquia_codigo, formFilterOptions.parroquias) || null
    dataToSend.nodo = getNombreFromCodigo(form.nodo_codigo, formFilterOptions.nodos) || null
    dataToSend.centralidad = getNombreFromCodigo(form.centralidad_codigo, formFilterOptions.centralidades) || null
    dataToSend.modalidad = getNombreFromCodigo(form.modalidad_codigo, formFilterOptions.modalidades) || null

    if (editingItem.value) {
      await experienciasService.update(editingItem.value.id_experiencia, dataToSend)
    } else {
      await experienciasService.create(dataToSend)
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
    await experienciasService.remove(deleteTarget.value.id_experiencia)
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

// Obtener código de un componente basado en el código seleccionado
function getCodigoComponent(field) {
  const codeField = `${field}_codigo`
  const value = form[codeField]
  return value || ''
}


const activeFiltersCount = computed(() => {
  return [
    filters.estado,
    filters.parroquia,
    filters.nodo,
    filters.centralidad,
    filters.modalidad,
  ].filter(Boolean).length
})

function clearAllFilters() {
  filters.estado = ''
  filters.parroquia = ''
  filters.nodo = ''
  filters.centralidad = ''
  filters.modalidad = ''
  filters.page = 1
  fetchFilterOptions()
  fetchItems()
}

onMounted(() => { fetchCatalogs(); fetchFilterOptions(); fetchKpis(); fetchItems() })
watch(() => filters.estado, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.parroquia, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
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
.search-box { position: relative; flex: 1; min-width: 220px; max-width: 360px; }
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
.nombre-text { font-weight: 500; color: #111827; }
.nombre-sub { font-size: 0.75rem; color: #9ca3af; }
.text-muted { color: #9ca3af; }
.badge { display: inline-block; padding: 0.2rem 0.625rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-success { background: #d1fae5; color: #065f46; }
.badge-warning { background: #fef3c7; color: #92400e; }
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
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field label { font-size: 0.8125rem; font-weight: 600; color: #374151; }
.req { color: #ef4444; }
.f-input, .f-select, .f-textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; color: #374151; background: white; box-sizing: border-box; font-family: inherit; transition: border-color 0.15s; }
.f-input:focus, .f-select:focus, .f-textarea:focus { outline: none; border-color: #1a56a0; }
.f-textarea { resize: vertical; min-height: 70px; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #374151; cursor: pointer; margin-top: 0.375rem; }
.checkbox-label input { width: 15px; height: 15px; cursor: pointer; }
.confirm-text { margin: 0; color: #374151; line-height: 1.6; }
.btn-view { color: #059669; }
.btn-view:hover { background: #d1fae5; border-color: #059669; }
.view-grid { display: flex; flex-direction: column; gap: 1.5rem; }
.view-section { display: flex; flex-direction: column; gap: 0.75rem; }
.view-section--map { order: -1; }
.view-section-title { font-size: 0.8125rem; font-weight: 700; color: #1a56a0; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
.view-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem 1.25rem; }
.view-field { display: flex; flex-direction: column; gap: 0.125rem; }
.view-field--full { grid-column: 1 / -1; }
.vf-label { font-size: 0.75rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
.vf-value { font-size: 0.875rem; color: #111827; line-height: 1.5; word-break: break-word; }
.vf-link { color: #1a56a0; text-decoration: underline; word-break: break-all; }
.vf-link:hover { color: #2d7dd2; }
.map-wrapper { position: relative; border-radius: 10px; overflow: hidden; border: 1.5px solid #e5e7eb; }
.map-iframe { width: 100%; height: 380px; border: none; display: block; }
.map-ext-link { display: inline-flex; align-items: center; gap: 0.375rem; position: absolute; bottom: 0.75rem; right: 0.75rem; padding: 0.375rem 0.75rem; background: white; border: 1.5px solid #d1d5db; border-radius: 6px; font-size: 0.75rem; font-weight: 600; color: #374151; text-decoration: none; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.map-ext-link:hover { background: #f9fafb; border-color: #1a56a0; color: #1a56a0; }
.map-ext-link svg { width: 13px; height: 13px; }

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
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.form-container::-webkit-scrollbar {
  width: 6px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Código QT Preview */
.codigo-preview {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border: 1.5px solid #e5e7eb;
}

.codigo-display {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.codigo-parts {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px dashed #d1d5db;
}

.codigo-part {
  flex: 0 0 auto;
  padding: 0.5rem 0.75rem;
  background: #1a56a0;
  color: white;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Courier New', monospace;
  min-width: 2rem;
  text-align: center;
}

.codigo-part.empty {
  background: #e5e7eb;
  color: #9ca3af;
  font-weight: 500;
}

.codigo-part.n-part {
  background: #059669;
}

/* Modal Tabs Styling */
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

.grid-1 { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }

.codigo-part.n-part.empty {
  background: #e5e7eb;
  color: #9ca3af;
}

.codigo-full {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 1.25rem;
  font-weight: 800;
  color: #1a56a0;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 2px solid #1a56a0;
  text-align: center;
  letter-spacing: 0.05em;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
