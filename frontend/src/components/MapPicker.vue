<template>
  <div class="map-picker-container">
    <div class="map-search">
      <div class="search-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar ubicación, dirección o lugar..."
          class="search-input"
          @keydown.enter="selectFirstSuggestion"
          @input="onSearchInput"
        />
        <div v-if="showSuggestions && searchSuggestions.length > 0" class="suggestions-dropdown" :style="suggestionsStyle">
          <div
            v-for="(suggestion, index) in searchSuggestions"
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <div class="suggestion-address">{{ suggestion.address }}</div>
            <div class="suggestion-type">{{ suggestion.type }}</div>
          </div>
        </div>
      </div>
      <button @click="centerMap" class="center-btn" title="Centrar en marcador">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 2v6m0 4v6M2 12h6m4 0h6"/>
        </svg>
      </button>
    </div>
    <div id="map" class="map-container" ref="mapElement"></div>
    <div class="map-info">
      <div class="info-row">
        <label>Latitud:</label>
        <input v-model.number="lat" type="number" step="0.0000001" class="coord-input" @change="updateMap" />
      </div>
      <div class="info-row">
        <label>Longitud:</label>
        <input v-model.number="lng" type="number" step="0.0000001" class="coord-input" @change="updateMap" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'

const props = defineProps({
  latitude: { type: Number, default: -0.2191000 },
  longitude: { type: Number, default: -78.5107000 },
  isEditing: { type: Boolean, default: false },
})

const emit = defineEmits(['update:latitude', 'update:longitude'])

const lat = ref(props.latitude)
const lng = ref(props.longitude)
const searchQuery = ref('')
const mapElement = ref(null)
const showSuggestions = ref(false)
const searchSuggestions = ref([])
const suggestionsStyle = ref({})
let map = null
let marker = null
let searchTimeout = null
let searchInputElement = null

const updateModelValue = () => {
  emit('update:latitude', lat.value)
  emit('update:longitude', lng.value)
}

const updateMap = () => {
  if (lat.value && lng.value && map) {
    map.setView([lat.value, lng.value], 15)
    if (marker) {
      marker.setLatLng([lat.value, lng.value])
    }
    updateModelValue()
  }
}

const updateSuggestionsPosition = () => {
  const inputElement = document.querySelector('.search-input')
  if (inputElement) {
    const rect = inputElement.getBoundingClientRect()
    const searchWrapper = inputElement.parentElement
    if (searchWrapper) {
      suggestionsStyle.value = {
        top: `${inputElement.offsetHeight + 4}px`,
        left: '0',
        width: '100%'
      }
    }
  }
}

const onSearchInput = async () => {
  clearTimeout(searchTimeout)

  if (!searchQuery.value.trim()) {
    showSuggestions.value = false
    searchSuggestions.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=8`
      )
      const results = await response.json()

      searchSuggestions.value = results.map(result => ({
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        address: result.display_name,
        type: result.type || 'lugar'
      }))

      showSuggestions.value = searchSuggestions.value.length > 0
      if (showSuggestions.value) {
        updateSuggestionsPosition()
      }
    } catch (err) {
      console.error('Error searching location:', err)
      showSuggestions.value = false
    }
  }, 500)
}

const selectSuggestion = (suggestion) => {
  lat.value = suggestion.lat
  lng.value = suggestion.lon
  searchQuery.value = suggestion.address.split(',')[0]
  showSuggestions.value = false
  suggestionsStyle.value = {}
  updateMap()
}

const selectFirstSuggestion = () => {
  if (searchSuggestions.value.length > 0) {
    selectSuggestion(searchSuggestions.value[0])
  }
}

const centerMap = () => {
  if (lat.value && lng.value && map) {
    map.setView([lat.value, lng.value], map.getZoom())
  }
}

const createMarker = () => {
  if (!map || !lat.value || !lng.value) return

  if (marker) {
    marker.setLatLng([lat.value, lng.value])
  } else {
    marker = L.marker([lat.value, lng.value], { draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      lat.value = parseFloat(pos.lat.toFixed(7))
      lng.value = parseFloat(pos.lng.toFixed(7))
      updateModelValue()
    })
  }
}

const initMap = () => {
  if (!mapElement.value) return

  // Inicializar mapa
  map = L.map(mapElement.value).setView([lat.value || -0.2191000, lng.value || -78.5107000], 12)

  // Agregar tiles de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  // Crear marcador inicial si hay coordenadas
  createMarker()

  // Click en el mapa para agregar marcador
  map.on('click', (e) => {
    const { lat: clickLat, lng: clickLng } = e.latlng
    lat.value = parseFloat(clickLat.toFixed(7))
    lng.value = parseFloat(clickLng.toFixed(7))
    createMarker()
    updateModelValue()
  })
}

watch(() => props.latitude, (newVal) => {
  if (newVal !== lat.value) {
    lat.value = newVal
    if (map && newVal && lng.value) {
      map.setView([newVal, lng.value], 15)
      createMarker()
    }
  }
})

watch(() => props.longitude, (newVal) => {
  if (newVal !== lng.value) {
    lng.value = newVal
    if (map && lat.value && newVal) {
      map.setView([lat.value, newVal], 15)
      createMarker()
    }
  }
})

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-picker-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  overflow: visible;
  position: relative;
}

.map-search {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.search-wrapper {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
}

.search-input:focus {
  outline: none;
  border-color: #1a56a0;
}

.suggestions-dropdown {
  position: absolute;
  background: white;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
}

.suggestion-item {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.15s;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f3f4f6;
}

.suggestion-address {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.suggestion-type {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.125rem;
  text-transform: capitalize;
}

.center-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.center-btn:hover {
  border-color: #1a56a0;
  color: #1a56a0;
  background: #dbeafe;
}

.center-btn svg {
  width: 16px;
  height: 16px;
}

.map-container {
  width: 100%;
  height: 350px;
  background: #f3f4f6;
}

:global(.map-container .leaflet-container) {
  width: 100%;
  height: 100%;
}

.map-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-row label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.coord-input {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Courier New', monospace;
  color: #374151;
}

.coord-input:focus {
  outline: none;
  border-color: #1a56a0;
}

@media (max-width: 640px) {
  .map-container {
    height: 250px;
  }

  .map-search {
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .search-wrapper {
    flex: 1 1 100%;
  }

  .suggestions-dropdown {
    max-height: 200px;
  }

  .center-btn {
    flex: 0 0 36px;
  }

  .map-info {
    grid-template-columns: 1fr;
  }
}
</style>
