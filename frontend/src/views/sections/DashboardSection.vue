<template>
  <div class="dash">
    <!-- KPIs -->
    <div class="kpi-row">
      <div class="kpi kpi-blue" :class="{ 'kpi-selected': selectedKpi === 'atractivos' }" @click="selectKpi('atractivos')">
        <div class="kpi-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-num">{{ dataLoading ? '…' : (statsData.atractivos ?? '—') }}</span>
          <span class="kpi-lbl">Atractivos</span>
          <span class="kpi-sub">{{ atrActivosCount }} activos</span>
        </div>
        <div class="kpi-indicator" v-if="selectedKpi === 'atractivos'">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm3.7 7.7l-4.7 4.7-2.4-2.4a1 1 0 1 0-1.4 1.4l3.1 3.1a1 1 0 0 0 1.4 0l5.4-5.4a1 1 0 0 0-1.4-1.4z"/></svg>
        </div>
      </div>

      <div class="kpi kpi-green" :class="{ 'kpi-selected': selectedKpi === 'experiencias' }" @click="selectKpi('experiencias')">
        <div class="kpi-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-num">{{ dataLoading ? '…' : (statsData.experiencias ?? '—') }}</span>
          <span class="kpi-lbl">Experiencias</span>
          <span class="kpi-sub">{{ expActivasCount }} activas</span>
        </div>
        <div class="kpi-indicator" v-if="selectedKpi === 'experiencias'">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm3.7 7.7l-4.7 4.7-2.4-2.4a1 1 0 1 0-1.4 1.4l3.1 3.1a1 1 0 0 0 1.4 0l5.4-5.4a1 1 0 0 0-1.4-1.4z"/></svg>
        </div>
      </div>

      <div class="kpi kpi-amber" :class="{ 'kpi-selected': selectedKpi === 'rutas' }" @click="selectKpi('rutas')">
        <div class="kpi-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
        </div>
        <div class="kpi-body">
          <span class="kpi-num">{{ dataLoading ? '…' : (statsData.rutas ?? '—') }}</span>
          <span class="kpi-lbl">Rutas</span>
          <span class="kpi-sub">{{ rutActivasCount }} activas</span>
        </div>
        <div class="kpi-indicator" v-if="selectedKpi === 'rutas'">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm3.7 7.7l-4.7 4.7-2.4-2.4a1 1 0 1 0-1.4 1.4l3.1 3.1a1 1 0 0 0 1.4 0l5.4-5.4a1 1 0 0 0-1.4-1.4z"/></svg>
        </div>
      </div>
    </div>

    <!-- MAPA + LISTA + ESTADÍSTICAS (3 COLUMNAS) -->
    <div class="dashboard-grid-3col">
      <!-- LISTA PANEL (IZQUIERDA) -->
      <div class="list-panel">
        <div class="lp-head">
          <h2 class="lp-title">
            <span v-if="!selectedKpi">Todos</span>
            <span v-else-if="selectedKpi === 'atractivos'">Atractivos</span>
            <span v-else-if="selectedKpi === 'experiencias'">Experiencias</span>
            <span v-else-if="selectedKpi === 'rutas'">Rutas</span>
          </h2>
          <span class="lp-count" v-if="!dataLoading && filteredListItems.length > 0">{{ filteredListItems.length }}</span>
        </div>

        <!-- LOADING STATE -->
        <div v-if="dataLoading" class="lp-loading">
          <div class="ld-spinner"></div>
        </div>

        <!-- FILTERED LIST -->
        <div v-else class="lp-items">
          <div v-for="item in listPageItems" :key="item.id_atractivo || item.id_experiencia || item.id_ruta"
            class="lp-item" :class="{
              'lp-item-selected': (selectedKpi === 'rutas' && selectedRoute?.id_ruta === item.id_ruta) ||
                                 (selectedKpi !== 'rutas' && selectedPointId === (item.id_atractivo || item.id_experiencia))
            }"
            @click="filterMapByPoint(item)"
          >
            <div class="lpi-name">{{ item.nombre }}</div>
            <div class="lpi-meta">
              <span v-if="item.categoria" class="lpi-cat">{{ item.categoria }}</span>
              <span v-else-if="item.tipo_experiencia" class="lpi-cat">{{ item.tipo_experiencia }}</span>
              <span v-else-if="item.tipo_ruta" class="lpi-cat">{{ item.tipo_ruta }}</span>
            </div>
          </div>
          <div v-if="filteredListItems.length === 0" class="lp-empty">Sin resultados</div>
        </div>

        <!-- PAGINATION -->
        <div v-if="!dataLoading && filteredListItems.length > itemsPerPage" class="lp-pagination">
          <button class="lp-btn-prev" :disabled="listPage === 0" @click="listPage--">← Anterior</button>
          <span class="lp-page-info">{{ listPage + 1 }} / {{ totalPages }}</span>
          <button class="lp-btn-next" :disabled="listPage >= totalPages - 1" @click="listPage++">Siguiente →</button>
        </div>
      </div>

      <!-- MAPA PANEL (CENTRO) -->
      <div class="map-panel">
        <!-- LEAFLET MAP (cuando NO está seleccionadas Rutas) -->
        <template v-if="selectedKpi !== 'rutas'">
          <div class="map-head">
            <div class="map-head-info">
              <div class="map-head-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              </div>
              <div>
                <h3 class="map-title">Mapa de Puntos Turísticos</h3>
                <p class="map-sub">{{ mapPointsTotal }} ubicaciones georeferenciadas en el DMQ</p>
              </div>
            </div>
          </div>

          <!-- FILTER BAR (cuando hay KPI seleccionado) -->
          <div v-if="selectedKpi === 'atractivos'" class="filter-bar">
            <div class="fb-group">
              <span class="fb-label">Categoría:</span>
              <div class="fb-chips">
                <button v-for="cat in chartAtrCategoria" :key="cat.key"
                  class="fb-chip" :class="{ 'fb-chip-active': selectedCategoryFilter === cat.key }"
                  @click="selectedCategoryFilter === cat.key ? selectedCategoryFilter = null : selectedCategoryFilter = cat.key; refreshMarkers()">
                  {{ cat.label }} ({{ cat.count }})
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="selectedKpi === 'experiencias'" class="filter-bar">
            <div class="fb-group">
              <span class="fb-label">Tipo:</span>
              <div class="fb-chips">
                <button v-for="tipo in chartExpTipo" :key="tipo.key"
                  class="fb-chip" :class="{ 'fb-chip-active': selectedCategoryFilter === tipo.key }"
                  @click="selectedCategoryFilter === tipo.key ? selectedCategoryFilter = null : selectedCategoryFilter = tipo.key; refreshMarkers()">
                  {{ tipo.label }} ({{ tipo.count }})
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="selectedKpi === 'rutas'" class="filter-bar">
            <div class="fb-group">
              <span class="fb-label">Dificultad:</span>
              <div class="fb-chips">
                <button v-for="dif in chartRutDificultad" :key="dif.key"
                  class="fb-chip" :class="{ 'fb-chip-active': selectedCategoryFilter === dif.key }"
                  @click="selectedCategoryFilter === dif.key ? selectedCategoryFilter = null : selectedCategoryFilter = dif.key; refreshMarkers()">
                  {{ dif.label }} ({{ dif.count }})
                </button>
              </div>
            </div>
          </div>

          <div ref="mapEl" class="map-box">
            <div v-if="!mapReady" class="map-placeholder">
              <div class="ld-spinner"></div>
              <span>Cargando mapa...</span>
            </div>
          </div>
          <div v-if="mapError" class="map-err">
            ⚠ No se pudo cargar el mapa.
            <a href="https://www.google.com/maps/@-0.18,-78.47,12z" target="_blank" rel="noopener noreferrer">Abrir Google Maps →</a>
          </div>
        </template>

        <!-- GOOGLE MAPS IFRAME (cuando está seleccionadas Rutas) -->
        <template v-else-if="selectedKpi === 'rutas'">
          <div class="ruta-map-head">
            <div class="ruta-map-info">
              <div class="ruta-map-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
              </div>
              <div>
                <h3 class="ruta-map-title">{{ selectedRoute ? selectedRoute.nombre : 'Selecciona una ruta' }}</h3>
                <p class="ruta-map-sub" v-if="selectedRoute && selectedRoute.tipo_ruta">{{ selectedRoute.tipo_ruta }}</p>
              </div>
            </div>
          </div>
          <div v-if="selectedRoute && mapEmbedUrl" class="ruta-map-box">
            <iframe
              :src="mapEmbedUrl"
              class="ruta-map-iframe"
              width="100%"
              height="100%"
              style="border: 0"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>
          <div v-else class="ruta-map-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            <span>Selecciona una ruta para ver el mapa</span>
          </div>
        </template>
      </div>

      <!-- COUNTERS PANEL (DERECHA) -->
      <div class="counters-panel">
        <div v-if="!dataLoading" class="cp-totals">
          <div class="cp-card">
            <div class="cpc-value">{{ totalActivos }}</div>
            <div class="cpc-label">Activos en mapa</div>
          </div>
        </div>

        <!-- Contadores por categoría según el KPI seleccionado -->
        <div v-if="!dataLoading && !selectedKpi" class="cp-summary">
          <div class="cp-item">
            <div class="cpi-count">{{ statsData.atractivos || 0 }}</div>
            <div class="cpi-label">Atractivos</div>
          </div>
          <div class="cp-item">
            <div class="cpi-count">{{ statsData.experiencias || 0 }}</div>
            <div class="cpi-label">Experiencias</div>
          </div>
          <div class="cp-item">
            <div class="cpi-count">{{ statsData.rutas || 0 }}</div>
            <div class="cpi-label">Rutas</div>
          </div>
        </div>

        <!-- Desglose de atractivos por categoría -->
        <div v-else-if="!dataLoading && selectedKpi === 'atractivos'" class="cp-breakdown">
          <h4 class="cpb-title">Por Categoría</h4>
          <div v-for="item in chartAtrCategoria.slice(0,6)" :key="item.key" class="cpb-item">
            <span class="cpbi-label">{{ item.label }}</span>
            <span class="cpbi-count">{{ item.count }}</span>
          </div>
        </div>

        <!-- Desglose de experiencias por tipo -->
        <div v-else-if="!dataLoading && selectedKpi === 'experiencias'" class="cp-breakdown">
          <h4 class="cpb-title">Por Tipo</h4>
          <div v-for="item in chartExpTipo.slice(0,6)" :key="item.key" class="cpb-item">
            <span class="cpbi-label">{{ item.label }}</span>
            <span class="cpbi-count">{{ item.count }}</span>
          </div>
        </div>

        <!-- Desglose de rutas por dificultad -->
        <div v-else-if="!dataLoading && selectedKpi === 'rutas'" class="cp-breakdown">
          <h4 class="cpb-title">Por Dificultad</h4>
          <div v-for="item in chartRutDificultad" :key="item.key" class="cpb-item">
            <span class="cpbi-label">{{ item.label }}</span>
            <span class="cpbi-count">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, h } from 'vue'
import { dashboardService } from '@/services/dashboard'
import { atractivosService } from '@/services/atractivos'
import { experienciasService } from '@/services/experiencias'
import { rutasService } from '@/services/rutas'

const emit = defineEmits(['navigate'])

// ── State ──────────────────────────────────────────────
const dataLoading = ref(true)
const mapReady    = ref(false)
const mapError    = ref(false)
const activeTab   = ref('todos')
const selectedKpi = ref(null)
const showAtrs    = ref(true)
const showExps    = ref(true)
const showRutas   = ref(true)
const mapEl       = ref(null)
const selectedCategoryFilter = ref(null)
const selectedSecondaryFilter = ref(null)
const selectedPointId = ref(null)
const selectedRoute = ref(null)
const listPage    = ref(0)

const statsData        = reactive({ atractivos: null, experiencias: null, rutas: null, por_estado: [], por_categoria: [] })
const atractivosData   = ref([])
const experienciasData = ref([])
const rutasData        = ref([])

let leafletMap  = null
let atrLayer    = null
let expLayer    = null
let rutasLayer  = null

// ── Icons ──────────────────────────────────────────────
const mkIcon = (paths) => ({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, paths.map((p) => h(...p)))
})
const IconTodos       = mkIcon([['rect', { x: '3', y: '3', width: '7', height: '7' }], ['rect', { x: '14', y: '3', width: '7', height: '7' }], ['rect', { x: '14', y: '14', width: '7', height: '7' }], ['rect', { x: '3', y: '14', width: '7', height: '7' }]])
const IconAtractivos  = mkIcon([['path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }], ['polyline', { points: '9 22 9 12 15 12 15 22' }]])
const IconExperiencias = mkIcon([['polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }]])
const IconRutas       = mkIcon([['path', { d: 'M3 12h18' }], ['path', { d: 'M3 6h18' }], ['path', { d: 'M3 18h18' }]])

const tabs = [
  { key: 'todos',        label: 'Todos',        icon: IconTodos },
  { key: 'atractivos',   label: 'Atractivos',   icon: IconAtractivos },
  { key: 'experiencias', label: 'Experiencias', icon: IconExperiencias },
  { key: 'rutas',        label: 'Rutas',        icon: IconRutas },
]

// ── Helpers ────────────────────────────────────────────
function groupCount(arr, field) {
  return arr.reduce((acc, item) => {
    const k = item[field] || 'Sin especificar'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
}

function toChart(obj, colorMap = {}, labelMap = {}) {
  const entries = Object.entries(obj).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map((e) => e[1]), 1)
  return entries.map(([key, count]) => ({
    key,
    label: labelMap[key] || key,
    count,
    pct: Math.round((count / max) * 100),
    color: colorMap[key] || '#64748b',
  }))
}

const ESTADO_COLORS = { ACTIVO: '#10b981', INACTIVO: '#9ca3af', EN_REVISION: '#f59e0b' }
const ESTADO_LABELS = { ACTIVO: 'Activo', INACTIVO: 'Inactivo', EN_REVISION: 'En revisión' }
const DIFIC_COLORS  = { FACIL: '#10b981', MODERADO: '#f59e0b', DIFICIL: '#f97316', MUY_DIFICIL: '#ef4444' }
const DIFIC_LABELS  = { FACIL: 'Fácil', MODERADO: 'Moderado', DIFICIL: 'Difícil', MUY_DIFICIL: 'Muy difícil' }

// ── Computed KPIs ──────────────────────────────────────
const atrActivosCount = computed(() => statsData.por_estado?.find((e) => e.estado === 'ACTIVO')?.total ?? 0)
const expActivasCount = computed(() => experienciasData.value.filter((e) => e.estado_experiencia === 'ACTIVO').length)
const rutActivasCount = computed(() => rutasData.value.filter((r) => r.estado === 'ACTIVO').length)
const totalRegistros  = computed(() => (statsData.atractivos ?? 0) + (statsData.experiencias ?? 0) + (statsData.rutas ?? 0))
const totalActivos    = computed(() => atrActivosCount.value + expActivasCount.value + rutActivasCount.value)

// ── Computed map points ────────────────────────────────
const atractivosConCoordenadas   = computed(() => atractivosData.value.filter((a) => a.latitud && a.longitud))
const experienciasConCoordenadas = computed(() => experienciasData.value.filter((e) => e.latitud && e.longitud))
const rutasConCoordenadas = computed(() => {
  // Mostrar TODAS las rutas, sin filtro de coordenadas, para debuggear
  console.log('rutasConCoordenadas: total rutas =', rutasData.value.length)
  if (rutasData.value.length > 0) {
    const r = rutasData.value[0]
    console.log('Primera ruta campos:', Object.keys(r))
    console.log('Primera ruta muestra:', {
      nombre: r.nombre,
      punto_inicio_lat: r.punto_inicio_lat,
      punto_inicio_lng: r.punto_inicio_lng,
      punto_fin_lat: r.punto_fin_lat,
      punto_fin_lng: r.punto_fin_lng,
      // Buscar campos alternativos
      latInicio: r.latInicio,
      lngInicio: r.lngInicio,
      latFin: r.latFin,
      lngFin: r.lngFin,
      lat_inicio: r.lat_inicio,
      lng_inicio: r.lng_inicio,
      lat_fin: r.lat_fin,
      lng_fin: r.lng_fin,
    })
  }
  return rutasData.value
})
const mapPointsTotal = computed(() => atractivosConCoordenadas.value.length + experienciasConCoordenadas.value.length + rutasConCoordenadas.value.length)

// ── Computed list filtering ────────────────────────────
const itemsPerPage = 12
const filteredListItems = computed(() => {
  if (selectedKpi.value === 'atractivos') {
    let items = atractivosData.value
    if (selectedCategoryFilter.value) items = items.filter((a) => a.categoria === selectedCategoryFilter.value)
    return items
  } else if (selectedKpi.value === 'experiencias') {
    let items = experienciasData.value
    if (selectedCategoryFilter.value) items = items.filter((e) => e.tipo_experiencia === selectedCategoryFilter.value)
    return items
  } else if (selectedKpi.value === 'rutas') {
    let items = rutasData.value
    if (selectedCategoryFilter.value) items = items.filter((r) => r.tipo_ruta === selectedCategoryFilter.value)
    return items
  }
  return []
})

const totalPages = computed(() => Math.ceil(filteredListItems.value.length / itemsPerPage) || 1)
const listPageItems = computed(() => {
  const start = listPage.value * itemsPerPage
  const end = start + itemsPerPage
  return filteredListItems.value.slice(start, end)
})

// ── Computed charts — Atractivos ───────────────────────
const chartAtrEstado = computed(() => {
  const obj = {}
  for (const item of (statsData.por_estado || [])) obj[item.estado] = item.total
  return toChart(obj, ESTADO_COLORS, ESTADO_LABELS)
})

const chartAtrCategoria = computed(() => {
  const obj = {}
  for (const item of (statsData.por_categoria || [])) obj[item.nombre] = item.total
  return toChart(obj)
})

const chartAtrJerarquia = computed(() => {
  const obj = groupCount(atractivosData.value, 'jerarquia')
  const lblMap = { '0': 'Sin jerarquía', '1': '★ Jerarquía I', '2': '★★ Jerarquía II', '3': '★★★ Jerarquía III', '4': '★★★★ Jerarquía IV' }
  const colMap = { '0': '#9ca3af', '1': '#fcd34d', '2': '#f59e0b', '3': '#d97706', '4': '#b45309' }
  return toChart(obj, colMap, lblMap)
})

const chartAtrParroquia = computed(() => toChart(groupCount(atractivosData.value, 'parroquia')))

// ── Computed charts — Experiencias ────────────────────
const chartExpTipo = computed(() => toChart(groupCount(experienciasData.value, 'tipo_experiencia')))

const chartExpEstado = computed(() => {
  const obj = groupCount(experienciasData.value, 'estado_experiencia')
  return toChart(obj, ESTADO_COLORS, ESTADO_LABELS)
})

const chartExpAccesible = computed(() => {
  const si = experienciasData.value.filter((e) => e.accesible).length
  const no = experienciasData.value.length - si
  const max = Math.max(si, no, 1)
  return [
    { key: 'si', label: 'Accesible', count: si, pct: Math.round((si / max) * 100), color: '#10b981' },
    { key: 'no', label: 'No accesible', count: no, pct: Math.round((no / max) * 100), color: '#9ca3af' },
  ]
})

const chartExpParroquia = computed(() => toChart(groupCount(experienciasData.value, 'parroquia')))

// ── Computed charts — Rutas ───────────────────────────
const chartRutDificultad = computed(() => {
  const obj = groupCount(rutasData.value, 'dificultad')
  return toChart(obj, DIFIC_COLORS, DIFIC_LABELS)
})

const chartRutTipo     = computed(() => toChart(groupCount(rutasData.value, 'tipo_ruta')))
const chartRutEstado   = computed(() => toChart(groupCount(rutasData.value, 'estado'), ESTADO_COLORS, ESTADO_LABELS))
const chartRutModalidad = computed(() => toChart(groupCount(rutasData.value, 'modalidad')))

// ── KPI Selection ──────────────────────────────────────
function selectKpi(kpi) {
  listPage.value = 0
  if (selectedKpi.value === kpi) {
    selectedKpi.value = null
    selectedCategoryFilter.value = null
    selectedSecondaryFilter.value = null
    selectedRoute.value = null
    activeTab.value = 'todos'
  } else {
    selectedKpi.value = kpi
    selectedCategoryFilter.value = null
    selectedSecondaryFilter.value = null
    if (kpi === 'atractivos') activeTab.value = 'atractivos'
    else if (kpi === 'experiencias') activeTab.value = 'experiencias'
    else if (kpi === 'rutas') {
      activeTab.value = 'rutas'
      // Auto-selecciona la primera ruta
      if (rutasData.value.length > 0) {
        selectedRoute.value = rutasData.value[0]
      }
    }
  }
  refreshMarkers()
}

function selectCategoryFilter(category) {
  selectedCategoryFilter.value = selectedCategoryFilter.value === category ? null : category
  refreshMarkers()
}

function estadoBadgeClass(item) {
  const estado = item.estado || item.estado_experiencia
  return { ACTIVO: 'badge-success', INACTIVO: 'badge-gray', EN_REVISION: 'badge-warning' }[estado] || 'badge-gray'
}

function estadoLabel(item) {
  const estado = item.estado || item.estado_experiencia
  return { ACTIVO: 'Activo', INACTIVO: 'Inactivo', EN_REVISION: 'En revisión' }[estado] || estado
}

function filterMapByPoint(item) {
  // Si es una ruta, seleccionar para mostrar en Google My Maps
  if (item.id_ruta) {
    selectedRoute.value = selectedRoute.value?.id_ruta === item.id_ruta ? null : item
  } else {
    // Para atractivos y experiencias, usar el comportamiento anterior
    selectedPointId.value = selectedPointId.value === (item.id_atractivo || item.id_experiencia) ? null : (item.id_atractivo || item.id_experiencia)
  }
  refreshMarkers()
}

function resetFilters() {
  listPage.value = 0
  selectedKpi.value = null
  selectedCategoryFilter.value = null
  selectedSecondaryFilter.value = null
  selectedPointId.value = null
  activeTab.value = 'todos'
  showAtrs.value = true
  showExps.value = true
  showRutas.value = true
  refreshMarkers()
}

// Computed para puntos visibles después de filtros
const filteredVisibleAtractivos = computed(() => {
  let items = atractivosConCoordenadas.value
  if (selectedPointId.value) items = items.filter(a => a.id_atractivo === selectedPointId.value)
  if (selectedCategoryFilter.value && selectedKpi.value === 'atractivos') items = items.filter(a => a.categoria === selectedCategoryFilter.value)
  return items
})

const filteredVisibleExperiencias = computed(() => {
  let items = experienciasConCoordenadas.value
  if (selectedPointId.value) items = items.filter(e => e.id_experiencia === selectedPointId.value)
  if (selectedCategoryFilter.value && selectedKpi.value === 'experiencias') items = items.filter(e => e.tipo_experiencia === selectedCategoryFilter.value)
  return items
})

const filteredVisibleRutas = computed(() => {
  let items = rutasConCoordenadas.value
  if (selectedPointId.value) items = items.filter(r => r.id_ruta === selectedPointId.value)
  if (selectedCategoryFilter.value && selectedKpi.value === 'rutas') items = items.filter(r => r.tipo_ruta === selectedCategoryFilter.value)
  return items
})

// Embed URL para Google My Maps
const mapEmbedUrl = computed(() => {
  const url = selectedRoute.value?.link_de_ruta
  if (!url) return null
  try {
    // Convertir URLs de Google Maps de edición a embed
    if (url.includes('/edit?')) {
      return url.replace('/edit?', '/embed?')
    }
    if (url.includes('/u/0/edit?')) {
      return url.replace('/u/0/edit?', '/embed?')
    }
    // Si ya es un embed, devolverlo como está
    if (url.includes('/embed?')) {
      return url
    }
    // Intentar extraer el mid y crear URL de embed
    const midMatch = url.match(/mid=([^&]+)/)
    if (midMatch && midMatch[1]) {
      return `https://www.google.com/maps/d/embed?mid=${midMatch[1]}`
    }
    return url
  } catch {
    return null
  }
})

// ── Data fetching ──────────────────────────────────────
async function fetchAll() {
  dataLoading.value = true
  try {
    const [stRes, aRes, eRes, rRes] = await Promise.all([
      dashboardService.getStats(),
      atractivosService.getAll({ limit: 1000 }),
      experienciasService.getAll({ limit: 1000 }),
      rutasService.getAll({ limit: 1000 }),
    ])
    Object.assign(statsData, stRes.data)
    atractivosData.value   = aRes.data.data ?? []
    experienciasData.value = eRes.data.data ?? []

    // Prueba múltiples estructuras de respuesta para rutas
    console.log('DEBUG: rRes.data estructura:', Object.keys(rRes.data))
    console.log('DEBUG: rRes.data.data type:', typeof rRes.data.data, 'length:', Array.isArray(rRes.data.data) ? rRes.data.data.length : 'no array')
    console.log('DEBUG: rRes.data.items type:', typeof rRes.data.items, 'length:', Array.isArray(rRes.data.items) ? rRes.data.items.length : 'no array')

    rutasData.value = rRes.data.data ?? rRes.data.items ?? rRes.data ?? []

    console.log('Rutas cargadas:', rutasData.value.length)
    if (rutasData.value.length > 0) {
      const firstRuta = rutasData.value[0]
      console.log('Primera ruta - todos los campos:', Object.keys(firstRuta))
      console.log('Primera ruta - valores:', firstRuta)
    }
  } catch (e) {
    console.error('Dashboard fetch error:', e)
  } finally {
    dataLoading.value = false
    await new Promise((r) => setTimeout(r, 50))
    selectedKpi.value = 'atractivos'
    activeTab.value = 'atractivos'
    initMap()
  }
}

// ── Leaflet map ────────────────────────────────────────
async function loadLeaflet() {
  if (window.L) return true
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
  return new Promise((resolve) => {
    if (document.getElementById('leaflet-js')) {
      document.getElementById('leaflet-js').addEventListener('load', () => resolve(true))
      return
    }
    const s = document.createElement('script')
    s.id  = 'leaflet-js'
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    s.onload  = () => resolve(true)
    s.onerror = () => { mapError.value = true; resolve(false) }
    document.head.appendChild(s)
  })
}

async function initMap() {
  if (!mapEl.value) return
  const ok = await loadLeaflet()
  if (!ok) return

  const L = window.L
  leafletMap = L.map(mapEl.value, { zoomControl: true }).setView([-0.18, -78.47], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(leafletMap)

  atrLayer = L.layerGroup().addTo(leafletMap)
  expLayer = L.layerGroup().addTo(leafletMap)
  rutasLayer = L.layerGroup().addTo(leafletMap)

  mapReady.value = true
  refreshMarkers()
}

function makeCircle(color) {
  return {
    radius: 7,
    fillColor: color,
    color: 'white',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.88,
  }
}

function makeCrossIcon() {
  return L.divIcon({
    html: `<svg viewBox="0 0 24 24" fill="none" stroke="#1a56a0" stroke-width="2" width="28" height="28"><path d="M12 5v14M5 12h14"/></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: 'custom-icon-cross'
  })
}

function makeChurchIcon() {
  return L.divIcon({
    html: `<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" width="28" height="28"><path d="M12 2l6 6v2h2v12H4V10h2V8l6-6z"/><path d="M12 14v4M10 14h4"/></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: 'custom-icon-church'
  })
}

function refreshMarkers() {
  if (!leafletMap || !window.L) return
  const L = window.L

  atrLayer.clearLayers()
  expLayer.clearLayers()
  rutasLayer.clearLayers()

  const showAtr = (selectedKpi.value === null || selectedKpi.value === 'atractivos')
  const showExp = (selectedKpi.value === null || selectedKpi.value === 'experiencias')
  const showRut = (selectedKpi.value === null || selectedKpi.value === 'rutas')

  console.log('DEBUG refreshMarkers:', { showAtr, showExp, showRut, selectedKpi: selectedKpi.value, rutasCount: rutasData.value.length, rutasConCoordenadas: rutasConCoordenadas.value.length, filteredVisibleRutas: filteredVisibleRutas.value.length })

  if (showAtr) {
    for (const a of filteredVisibleAtractivos.value) {
      const stars = a.jerarquia > 0 ? '★'.repeat(a.jerarquia) + ' ' : ''
      const tooltip = `<div class="lf-tip"><strong>${a.nombre}</strong><br/>${a.categoria || ''}</div>`
      const popup = `<div class="lf-popup"><span class="lf-badge lf-atr">Atractivo</span><strong class="lf-name">${a.nombre}</strong>${a.categoria ? `<span class="lf-meta">${a.categoria}</span>` : ''}${stars ? `<span class="lf-meta">${stars}Jerarquía ${a.jerarquia}</span>` : ''}<span class="lf-coords">${(+a.latitud).toFixed(5)}, ${(+a.longitud).toFixed(5)}</span></div>`
      L.marker([+a.latitud, +a.longitud], { icon: makeCrossIcon() })
        .bindTooltip(tooltip, { sticky: true, className: 'lf-tooltip' })
        .bindPopup(popup, { maxWidth: 230 })
        .addTo(atrLayer)
    }
  }

  if (showExp) {
    for (const e of filteredVisibleExperiencias.value) {
      const tooltip = `<div class="lf-tip"><strong>${e.nombre}</strong><br/>${e.tipo_experiencia || ''}</div>`
      const popup = `<div class="lf-popup"><span class="lf-badge lf-exp">Experiencia</span><strong class="lf-name">${e.nombre}</strong>${e.tipo_experiencia ? `<span class="lf-meta">${e.tipo_experiencia}</span>` : ''}<span class="lf-coords">${(+e.latitud).toFixed(5)}, ${(+e.longitud).toFixed(5)}</span></div>`
      L.marker([+e.latitud, +e.longitud], { icon: makeChurchIcon() })
        .bindTooltip(tooltip, { sticky: true, className: 'lf-tooltip' })
        .bindPopup(popup, { maxWidth: 230 })
        .addTo(expLayer)
    }
  }

  if (showRut) {
    for (const r of filteredVisibleRutas.value) {
      const hasStart = r.punto_inicio_lat && r.punto_inicio_lng
      const hasEnd = r.punto_fin_lat && r.punto_fin_lng
      if (hasStart && hasEnd) {
        const startCoord = [+r.punto_inicio_lat, +r.punto_inicio_lng]
        const endCoord = [+r.punto_fin_lat, +r.punto_fin_lng]
        const tooltip = `<div class="lf-tip"><strong>${r.nombre}</strong><br/>${r.tipo_ruta || ''}</div>`

        // Línea azul de la ruta
        L.polyline([startCoord, endCoord], { color: '#0066cc', weight: 3, opacity: 0.8 })
          .bindTooltip(tooltip, { sticky: true, className: 'lf-tooltip' })
          .addTo(rutasLayer)

        // Marker de inicio (verde)
        L.circleMarker(startCoord, { radius: 6, fillColor: '#10b981', color: 'white', weight: 2, opacity: 1, fillOpacity: 0.9 })
          .bindTooltip(`<div class="lf-tip"><strong>${r.nombre}</strong><br/>Inicio: ${r.punto_inicio_nombre || 'Punto inicial'}</div>`, { sticky: true, className: 'lf-tooltip' })
          .addTo(rutasLayer)

        // Marker de fin (rojo)
        L.circleMarker(endCoord, { radius: 6, fillColor: '#ef4444', color: 'white', weight: 2, opacity: 1, fillOpacity: 0.9 })
          .bindTooltip(`<div class="lf-tip"><strong>${r.nombre}</strong><br/>Fin: ${r.punto_fin_nombre || 'Punto final'}</div>`, { sticky: true, className: 'lf-tooltip' })
          .addTo(rutasLayer)
      }
    }
  }
}

// Watch para destruir el mapa cuando cambias A rutas
watch(
  () => selectedKpi.value,
  async (newKpi, oldKpi) => {
    // Si cambias A rutas: destruir el mapa actual
    if (newKpi === 'rutas' && oldKpi !== 'rutas') {
      if (leafletMap) {
        leafletMap.remove()
        leafletMap = null
        mapReady.value = false
      }
    }
    // Si cambias DESDE rutas: reinicializar el mapa
    else if (oldKpi === 'rutas' && newKpi !== 'rutas') {
      await new Promise(r => setTimeout(r, 100))
      if (mapEl.value && !leafletMap) {
        initMap()
      }
    }
  }
)

// Watch para hacer zoom al seleccionar un punto
watch(
  () => selectedPointId.value,
  (newPointId) => {
    if (!leafletMap || !newPointId) return

    let coords = null

    if (selectedKpi.value === 'atractivos') {
      const item = atractivosData.value.find(a => a.id_atractivo === newPointId)
      if (item && item.latitud && item.longitud) {
        coords = [+item.latitud, +item.longitud]
      }
    } else if (selectedKpi.value === 'experiencias') {
      const item = experienciasData.value.find(e => e.id_experiencia === newPointId)
      if (item && item.latitud && item.longitud) {
        coords = [+item.latitud, +item.longitud]
      }
    }

    if (coords) {
      leafletMap.flyTo(coords, 16)
    }
  }
)

onMounted(fetchAll)
onUnmounted(() => { if (leafletMap) { leafletMap.remove(); leafletMap = null } })
</script>

<!-- Leaflet popup and tooltip styles (global, not scoped) -->
<style>
.lf-popup { padding: 2px 0; min-width: 170px; font-family: inherit; }
.lf-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-bottom: 6px; }
.lf-atr   { background: #dbeafe; color: #1e40af; }
.lf-exp   { background: #d1fae5; color: #065f46; }
.lf-name  { display: block; font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 3px; line-height: 1.3; }
.lf-meta  { display: block; font-size: 12px; color: #6b7280; margin-bottom: 1px; }
.lf-coords { display: block; font-size: 10px; color: #9ca3af; margin-top: 4px; font-family: monospace; }
.lf-tooltip { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
.lf-tip { font-size: 12px; color: #374151; }
.lf-tip strong { display: block; font-weight: 700; margin-bottom: 2px; }
</style>

<style scoped>
.dash { display: flex; flex-direction: column; gap: 1.5rem; }

/* ── HERO ── */
.hero {
  background: linear-gradient(135deg, #0f2b5b 0%, #1a56a0 60%, #2d7dd2 100%);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  color: white;
  box-shadow: 0 4px 20px rgba(15,43,91,0.25);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.875rem;
  letter-spacing: 0.03em;
}
.hero-badge svg { width: 13px; height: 13px; flex-shrink: 0; }

.hero-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.hero-desc {
  margin: 0;
  font-size: 0.9375rem;
  opacity: 0.8;
  line-height: 1.5;
  max-width: 480px;
}

.hero-nums {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  padding: 1.25rem 1.75rem;
}

.hn-item { display: flex; flex-direction: column; align-items: center; gap: 0.125rem; }
.hn-val  { font-size: 1.75rem; font-weight: 800; line-height: 1; }
.hn-lbl  { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.hn-sep  { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }

/* ── KPIs ── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.kpi {
  background: white;
  border-radius: 14px;
  padding: 1rem 1rem 1rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
  overflow: hidden;
}

.kpi::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}

.kpi-blue::before   { background: #1a56a0; }
.kpi-green::before  { background: #059669; }
.kpi-amber::before  { background: #d97706; }
.kpi-purple::before { background: #7c3aed; }

.kpi:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
.kpi-purple { cursor: default; }
.kpi-purple:hover { transform: none; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
.kpi-selected {
  border: 2px solid;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
}
.kpi-blue.kpi-selected { border-color: #1a56a0; background: linear-gradient(to right, rgba(26,86,160,0.05), transparent); }
.kpi-green.kpi-selected { border-color: #059669; background: linear-gradient(to right, rgba(5,150,105,0.05), transparent); }
.kpi-amber.kpi-selected { border-color: #d97706; background: linear-gradient(to right, rgba(217,119,6,0.05), transparent); }
.kpi-indicator { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; }
.kpi-blue.kpi-selected .kpi-indicator svg { color: #1a56a0; }
.kpi-green.kpi-selected .kpi-indicator svg { color: #059669; }
.kpi-amber.kpi-selected .kpi-indicator svg { color: #d97706; }

.kpi-ico {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-blue  .kpi-ico { background: #dbeafe; }
.kpi-green .kpi-ico { background: #d1fae5; }
.kpi-amber .kpi-ico { background: #fef3c7; }
.kpi-purple .kpi-ico { background: #ede9fe; }
.kpi-ico svg { width: 22px; height: 22px; }
.kpi-blue   .kpi-ico svg { stroke: #1a56a0; }
.kpi-green  .kpi-ico svg { stroke: #059669; }
.kpi-amber  .kpi-ico svg { stroke: #d97706; }
.kpi-purple .kpi-ico svg { stroke: #7c3aed; }

.kpi-body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.kpi-num  { font-size: 1.75rem; font-weight: 800; color: #111827; line-height: 1; }
.kpi-lbl  { font-size: 0.8125rem; color: #6b7280; margin-top: 0.125rem; font-weight: 500; }
.kpi-sub  { font-size: 0.75rem; color: #10b981; font-weight: 600; margin-top: 0.25rem; }
.kpi-arr  { width: 16px; height: 16px; color: #d1d5db; flex-shrink: 0; }
.kpi:hover .kpi-arr { color: #9ca3af; }

/* ── DASHBOARD GRID (3-Column Layout) ── */
.dashboard-grid-3col {
  display: grid;
  grid-template-columns: 260px 1fr 220px;
  gap: 1rem;
  height: calc(100vh - 290px);
}

.stats-sidebar {
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  background: white;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  flex: 1;
}

.btn-reset {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  transition: all 0.15s;
  color: #6b7280;
  flex-shrink: 0;
}
.btn-reset:hover { background: #f9fafb; color: #374151; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
.btn-reset svg { width: 16px; height: 16px; }

.sidebar-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  background: #fafbfc;
}

.tab-btn-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 7px;
  background: white;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.tab-btn-small:hover { background: white; color: #374151; border-color: #e5e7eb; }
.tab-btn-small.tab-active { background: white; color: #1a56a0; font-weight: 600; border-color: #1a56a0; }
.tab-icon { width: 16px; height: 16px; flex-shrink: 0; }

.sidebar-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  color: #9ca3af;
  font-size: 0.9375rem;
}

.sidebar-cards {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
}

.map-panel {
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── LIST PANEL (IZQUIERDA) ── */
.list-panel {
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  background: white;
}

.lp-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  flex: 1;
}

.lp-count {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.lp-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.lp-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
}

.lp-item {
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
  background: #f9fafb;
}

.lp-item:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.lp-item-selected {
  background: linear-gradient(135deg, rgba(26,86,160,0.1), transparent);
  border-color: #1a56a0;
  font-weight: 600;
}

.lpi-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.lpi-meta {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.lpi-cat {
  font-size: 0.75rem;
  color: #6b7280;
  background: white;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  line-height: 1.2;
}

.lp-empty {
  padding: 1rem;
  text-align: center;
  font-size: 0.8125rem;
  color: #9ca3af;
}

.lp-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid #f3f4f6;
  background: #fafbfc;
}

.lp-page-info {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.lp-btn-prev, .lp-btn-next {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a56a0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  flex: 1;
}

.lp-btn-prev:hover, .lp-btn-next:hover {
  background: #f3f4f6;
  border-color: #1a56a0;
  color: #0f2b5b;
}

.lp-btn-prev:disabled, .lp-btn-next:disabled {
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
  background: #f9fafb;
}

/* ── FILTER BAR ── */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.fb-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fb-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fb-chip {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.fb-chip:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.fb-chip-active {
  background: #1a56a0;
  color: white;
  border-color: #1a56a0;
  font-weight: 600;
}

/* ── COUNTERS PANEL (DERECHA) ── */
.counters-panel {
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
  gap: 1rem;
}

.cp-totals {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cp-card {
  background: linear-gradient(135deg, #1a56a0 0%, #2d7dd2 100%);
  border-radius: 10px;
  padding: 1rem;
  color: white;
  text-align: center;
}

.cpc-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.cpc-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cp-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cp-item {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.cpi-count {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1a56a0;
}

.cpi-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.cp-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.cpb-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.cpb-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 0.8125rem;
}

.cpbi-label {
  font-weight: 500;
  color: #374151;
}

.cpbi-count {
  font-weight: 700;
  color: #1a56a0;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  min-width: 28px;
  text-align: center;
}

/* ── TABS ── */
.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.tab-group {
  display: flex;
  gap: 0.375rem;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 0.25rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.tab-btn:hover { background: white; color: #374151; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.tab-btn.tab-active { background: white; color: #1a56a0; font-weight: 700; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

/* ── LOADING ── */
.panels-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: #9ca3af;
  font-size: 0.9375rem;
}

.ld-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid #e5e7eb;
  border-top-color: #1a56a0;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── PANELS ── */
.panels-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 0.875rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.sc-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.sc-head svg { width: 16px; height: 16px; flex-shrink: 0; }
.sc-head h4 { font-size: 0.75rem; font-weight: 700; color: #374151; margin: 0; }

.chart-list { display: flex; flex-direction: column; gap: 0.375rem; }

.chart-row {
  padding: 0.375rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.chart-row:hover { background: #f9fafb; }
.chart-row-active { background: linear-gradient(135deg, rgba(26,86,160,0.08), transparent); border-radius: 6px; }
.cr-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.2rem;
}
.cr-label { font-size: 0.75rem; color: #374151; font-weight: 500; }
.cr-count { font-size: 0.75rem; font-weight: 700; color: #111827; }
.cr-track { height: 4px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
.cr-bar   { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
.chart-empty { font-size: 0.75rem; color: #9ca3af; font-style: italic; margin: 0.25rem 0 0; }

/* ── SIDEBAR LIST ── */
.sidebar-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #f3f4f6;
  padding: 0.75rem;
}

.sl-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
}

.sl-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.sl-count {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.sl-items {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-height: 200px;
  overflow-y: auto;
}

.sl-item {
  padding: 0.5rem;
  border-radius: 6px;
  background: white;
  border: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.15s;
}

.sl-item:hover {
  background: #f9fafb;
  border-color: #e5e7eb;
}

.sl-item-selected {
  background: linear-gradient(135deg, rgba(26,86,160,0.1), transparent);
  border-color: #1a56a0;
  box-shadow: 0 1px 2px rgba(26,86,160,0.2);
}

.sli-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sli-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.sli-cat {
  font-size: 0.7rem;
  color: #6b7280;
}

.sli-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
}

.sl-empty {
  font-size: 0.8125rem;
  color: #9ca3af;
  text-align: center;
  padding: 1rem 0.5rem;
  font-style: italic;
}

.sl-more {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
  padding: 0.375rem;
  border-top: 1px solid #f3f4f6;
  margin-top: 0.375rem;
  padding-top: 0.375rem;
}

/* ── MAP ── */
.map-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

.map-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  flex-wrap: wrap;
}

.map-head-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.map-head-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #dbeafe, #ede9fe);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.map-head-icon svg { width: 22px; height: 22px; stroke: #1a56a0; }

.map-title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 0.125rem; }
.map-sub   { font-size: 0.8125rem; color: #6b7280; margin: 0; }

.map-toggles {
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.mtog {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.15s;
  user-select: none;
}
.mtog input { display: none; }
.mtog svg { width: 14px; height: 14px; }
.mtog-pill {
  width: 28px;
  height: 16px;
  border-radius: 99px;
  background: #d1d5db;
  position: relative;
  transition: background 0.15s;
  flex-shrink: 0;
}
.mtog-pill::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  transition: transform 0.15s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.mtog-on .mtog-pill::after { transform: translateX(12px); }
.mtog-on.mtog-blue  { border-color: #1a56a0; background: #eff6ff; color: #1a56a0; }
.mtog-on.mtog-blue  .mtog-pill { background: #1a56a0; }
.mtog-on.mtog-green { border-color: #059669; background: #f0fdf4; color: #059669; }
.mtog-on.mtog-green .mtog-pill { background: #059669; }
.mtog-on.mtog-amber { border-color: #d97706; background: #fffbeb; color: #d97706; }
.mtog-on.mtog-amber .mtog-pill { background: #d97706; }

.map-legend {
  display: flex;
  gap: 1.25rem;
  padding: 0.625rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}
.mleg { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: #374151; font-weight: 500; }
.mleg-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.15); flex-shrink: 0; }

.map-box {
  flex: 1;
  min-height: 500px;
  position: relative;
  background: #f0f4f8;
}

.map-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #9ca3af;
  font-size: 0.9375rem;
  z-index: 1;
}

.map-err {
  padding: 0.875rem 1.5rem;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.875rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.map-err a { color: #1a56a0; font-weight: 600; }

/* ── LIST ── */
.list-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.list-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.list-count {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 500;
  background: white;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
}

.list-items {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;
}

.list-item {
  padding: 0.875rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.list-item:hover {
  background: #fafbfc;
}

.list-item:last-child {
  border-bottom: none;
}

.li-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.375rem;
}

.li-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.li-cat {
  font-size: 0.75rem;
  color: #6b7280;
}

.li-badge {
  display: inline-block;
  padding: 0.2rem 0.625rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge-success { background: #d1fae5; color: #065f46; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-gray    { background: #f3f4f6; color: #6b7280; }

.list-more {
  padding: 0.75rem 1.5rem;
  text-align: center;
  font-size: 0.8125rem;
  color: #9ca3af;
  border-top: 1px solid #f3f4f6;
}

@media (max-width: 1400px) {
  .dashboard-grid-3col { grid-template-columns: 220px 1fr 200px; }
}

@media (max-width: 1200px) {
  .dashboard-grid-3col { grid-template-columns: 200px 1fr 180px; }
}

@media (max-width: 1024px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .hero { flex-direction: column; align-items: flex-start; }
  .hero-nums { width: 100%; justify-content: space-around; }
  .dashboard-grid-3col { grid-template-columns: 1fr; min-height: auto; }
}

@media (max-width: 768px) {
  .panels-grid { grid-template-columns: 1fr; }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .section-bar { flex-direction: column; align-items: flex-start; }
  .tab-group { flex-wrap: wrap; }
  .hero { padding: 1.5rem; }
  .hero-title { font-size: 1.5rem; }
  .sidebar-tabs { flex-direction: row; flex-wrap: wrap; }
}

/* ── RUTAS MAP (Google My Maps) ── */
.ruta-map-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  flex-wrap: wrap;
}

.ruta-map-info {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.ruta-map-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #fef3c7, #ede9fe);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ruta-map-icon svg { width: 22px; height: 22px; stroke: #d97706; }

.ruta-map-title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 0.125rem; }
.ruta-map-sub   { font-size: 0.8125rem; color: #6b7280; margin: 0; }

.ruta-map-box {
  flex: 1;
  min-height: 500px;
  position: relative;
  background: #f0f4f8;
}

.ruta-map-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.ruta-map-placeholder {
  flex: 1;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #9ca3af;
  font-size: 0.9375rem;
  background: #f9fafb;
}
.ruta-map-placeholder svg { width: 48px; height: 48px; color: #d1d5db; }

@media (max-width: 480px) {
  .kpi-row { grid-template-columns: 1fr; }
}
</style>
