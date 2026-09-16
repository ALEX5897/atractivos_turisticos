<template>
  <div class="reportes-section">
    <div class="header">
      <h1>Generador de Reportes</h1>
      <p>Selecciona los módulos y campos que deseas exportar a Excel</p>
    </div>

    <div class="container">
      <!-- Selector de módulos -->
      <section class="selector-section">
        <h3>1. Selecciona Módulos</h3>
        <div class="modulos-grid">
          <label class="checkbox-label">
            <input type="checkbox" v-model="modulos" value="atractivos">
            <span>Atractivos</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="modulos" value="experiencias">
            <span>Experiencias</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="modulos" value="rutas">
            <span>Rutas</span>
          </label>
        </div>
      </section>

      <!-- Selector de campos por módulo -->
      <section v-if="modulos.length > 0" class="selector-section campos-section">
        <h3>2. Selecciona Campos</h3>

        <div v-if="modulos.includes('atractivos')" class="modulo-campos">
          <div class="modulo-header">
            <h4>Atractivos</h4>
            <button @click="selectAllAtractivos" class="btn-small">Seleccionar todos</button>
            <button @click="deselectAllAtractivos" class="btn-small">Deseleccionar todos</button>
          </div>
          <div class="campos-grid">
            <label v-for="campo in camposDisponibles.atractivos" :key="campo.key" class="checkbox-label">
              <input type="checkbox" v-model="camposSeleccionados.atractivos" :value="campo.key">
              <span>{{ campo.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="modulos.includes('experiencias')" class="modulo-campos">
          <div class="modulo-header">
            <h4>Experiencias</h4>
            <button @click="selectAllExperiencias" class="btn-small">Seleccionar todos</button>
            <button @click="deselectAllExperiencias" class="btn-small">Deseleccionar todos</button>
          </div>
          <div class="campos-grid">
            <label v-for="campo in camposDisponibles.experiencias" :key="campo.key" class="checkbox-label">
              <input type="checkbox" v-model="camposSeleccionados.experiencias" :value="campo.key">
              <span>{{ campo.label }}</span>
            </label>
          </div>
        </div>

        <div v-if="modulos.includes('rutas')" class="modulo-campos">
          <div class="modulo-header">
            <h4>Rutas</h4>
            <button @click="selectAllRutas" class="btn-small">Seleccionar todos</button>
            <button @click="deselectAllRutas" class="btn-small">Deseleccionar todos</button>
          </div>
          <div class="campos-grid">
            <label v-for="campo in camposDisponibles.rutas" :key="campo.key" class="checkbox-label">
              <input type="checkbox" v-model="camposSeleccionados.rutas" :value="campo.key">
              <span>{{ campo.label }}</span>
            </label>
          </div>
        </div>
      </section>

      <!-- Filtros opcionales -->
      <section v-if="modulos.length > 0" class="selector-section filtros-section">
        <h3>3. Filtros (Opcional)</h3>
        <div class="filtros-grid">
          <div class="filtro-item">
            <label>Estado</label>
            <select v-model="filtros.estado">
              <option value="">-- Sin filtro --</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="EN_REVISION">En Revisión</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Botón de descarga -->
      <section v-if="modulos.length > 0" class="download-section">
        <button
          @click="descargarReporte"
          :disabled="descargando || camposSeleccionados.atractivos.length === 0 && camposSeleccionados.experiencias.length === 0 && camposSeleccionados.rutas.length === 0"
          class="btn-descargar"
        >
          <span v-if="descargando">⏳ Generando reporte...</span>
          <span v-else>📥 Descargar Excel</span>
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">✅ Reporte descargado correctamente</p>
      </section>
    </div>
  </div>
</template>

<script>
import { reportesService } from '@/services/reportes'

export default {
  name: 'ReportesSection',
  data() {
    return {
      modulos: [],
      camposDisponibles: {
        atractivos: [],
        experiencias: [],
        rutas: []
      },
      camposSeleccionados: {
        atractivos: [],
        experiencias: [],
        rutas: []
      },
      filtros: {
        estado: ''
      },
      descargando: false,
      error: null,
      success: false,
      loading: true
    }
  },

  async mounted() {
    try {
      const response = await reportesService.getCampos()
      this.camposDisponibles = response.data

      Object.keys(response.data).forEach(modulo => {
        this.camposSeleccionados[modulo] = response.data[modulo]
          .filter(c => c.mostSel)
          .map(c => c.key)
      })

      this.loading = false
    } catch (err) {
      this.error = 'Error al cargar los campos disponibles'
      console.error('Error:', err)
      this.loading = false
    }
  },

  methods: {
    async descargarReporte() {
      this.descargando = true
      this.error = null
      this.success = false

      try {
        const candescargar = this.modulos.some(m => {
          if (m === 'atractivos') return this.camposSeleccionados.atractivos.length > 0
          if (m === 'experiencias') return this.camposSeleccionados.experiencias.length > 0
          if (m === 'rutas') return this.camposSeleccionados.rutas.length > 0
          return false
        })

        if (!candescargar) {
          this.error = 'Debes seleccionar al menos un campo en los módulos seleccionados'
          this.descargando = false
          return
        }

        await reportesService.generarReporte({
          modulos: this.modulos,
          campos: this.camposSeleccionados,
          filtros: this.filtros
        })

        this.success = true
        setTimeout(() => {
          this.success = false
        }, 3000)
      } catch (err) {
        this.error = 'Error al descargar el reporte. Por favor intenta nuevamente.'
        console.error('Error descargando reporte:', err)
      } finally {
        this.descargando = false
      }
    },

    selectAllAtractivos() {
      this.camposSeleccionados.atractivos = this.camposDisponibles.atractivos.map(c => c.key)
    },
    deselectAllAtractivos() {
      this.camposSeleccionados.atractivos = []
    },

    selectAllExperiencias() {
      this.camposSeleccionados.experiencias = this.camposDisponibles.experiencias.map(c => c.key)
    },
    deselectAllExperiencias() {
      this.camposSeleccionados.experiencias = []
    },

    selectAllRutas() {
      this.camposSeleccionados.rutas = this.camposDisponibles.rutas.map(c => c.key)
    },
    deselectAllRutas() {
      this.camposSeleccionados.rutas = []
    }
  }
}
</script>

<style scoped>
.reportes-section {
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.header p {
  color: #666;
  margin: 0;
}

.container {
  max-width: 1200px;
}

.selector-section {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.selector-section h3 {
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background-color: #f0f0f0;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 14px;
  color: #333;
}

.campos-section {
  padding: 20px 20px;
}

.modulo-campos {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.modulo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.modulo-header h4 {
  margin: 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 10px;
}

.btn-small:hover {
  background-color: #e0e0e0;
}

.campos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.filtros-section {
  background: #fff3cd;
  border-color: #ffc107;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.filtro-item {
  display: flex;
  flex-direction: column;
}

.filtro-item label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.filtro-item select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.download-section {
  text-align: center;
  padding: 20px;
  background: #f0f7ff;
  border: 2px solid #4472C4;
  border-radius: 8px;
}

.btn-descargar {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  background-color: #4472C4;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-descargar:hover:not(:disabled) {
  background-color: #2e5090;
}

.btn-descargar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  margin-top: 10px;
  font-size: 14px;
}

.success-message {
  color: #388e3c;
  margin-top: 10px;
  font-size: 14px;
}
</style>
