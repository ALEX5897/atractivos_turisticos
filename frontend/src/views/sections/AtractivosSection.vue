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
          placeholder="Buscar por nombre, código o barrio..."
          class="search-input"
          @input="debouncedFetch"
        />
      </div>

      <button class="btn-create" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo Atractivo
      </button>
    </div>

    <!-- KPIs y Filtros -->
    <div class="kpis-section">
      <div class="kpis-row">
        <div class="kpi-card">
          <div class="kpi-label">Total de Registros</div>
          <div class="kpi-value">{{ total }}</div>
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
          <label class="filter-label">Categoría</label>
          <select v-model="filters.id_categoria" class="filter-select" @change="fetchItems">
            <option value="">Todas las categorías</option>
            <option v-for="c in cats.filterOptions.categorias" :key="c.id" :value="c.id">
              {{ c.nombre }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Parroquia</label>
          <select v-model="filters.id_parroquia" class="filter-select" @change="fetchItems">
            <option value="">Todas las parroquias</option>
            <option v-for="p in cats.filterOptions.parroquias" :key="p.id" :value="p.id">
              {{ p.nombre }}
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
          <label class="filter-label">Subcentralidad</label>
          <select v-model="filters.subcentralidad" class="filter-select" @change="fetchItems">
            <option value="">Todas las subcentralidades</option>
            <option v-for="s in cats.filterOptions.subcentralidades" :key="s" :value="s">
              {{ s }}
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
          <div v-if="filters.id_categoria" class="filter-chip">
            <span class="chip-label">Categoría: <strong>{{ getCategoryName() }}</strong></span>
            <button class="chip-remove" @click="filters.id_categoria = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
          </div>
          <div v-if="filters.id_parroquia" class="filter-chip">
            <span class="chip-label">Parroquia: <strong>{{ getParroquiaName() }}</strong></span>
            <button class="chip-remove" @click="filters.id_parroquia = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
          </div>
          <div v-if="filters.nodo" class="filter-chip">
            <span class="chip-label">Nodo: <strong>{{ filters.nodo }}</strong></span>
            <button class="chip-remove" @click="filters.nodo = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
          </div>
          <div v-if="filters.centralidad" class="filter-chip">
            <span class="chip-label">Centralidad: <strong>{{ filters.centralidad }}</strong></span>
            <button class="chip-remove" @click="filters.centralidad = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
          </div>
          <div v-if="filters.subcentralidad" class="filter-chip">
            <span class="chip-label">Subcentralidad: <strong>{{ filters.subcentralidad }}</strong></span>
            <button class="chip-remove" @click="filters.subcentralidad = ''; fetchFilterOptions(); fetchItems()" title="Remover filtro">✕</button>
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
      row-key="id_atractivo"
      @page-change="onPageChange"
    >
      <template #cell-codigo_qt="{ value }">
        <code class="cell-code">{{ value }}</code>
      </template>

      <template #cell-n="{ row }">
        {{ padNumber(row.id_atractivo) }}
      </template>

      <template #cell-nombre="{ row }">
        <div class="cell-nombre">
          <span class="nombre-text">{{ row.nombre }}</span>
          <span v-if="row.parroquia" class="nombre-sub">{{ row.parroquia }}</span>
        </div>
      </template>

      <template #cell-jerarquia="{ value }">
        <div class="stars">
          <span v-for="i in 4" :key="i" :class="['star', i <= value ? 'star-on' : 'star-off']">★</span>
        </div>
      </template>

      <template #cell-estado="{ value }">
        <span class="badge" :class="badgeClass(value)">{{ estadoLabel(value) }}</span>
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
      :title="editingItem ? `Editar Atractivo - ${editingItem.nombre}` : 'Nuevo Atractivo'"
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
            <!-- 1-3. ESTADO, CÓDIGO MINTUR, CÓDIGO QT -->
            <div class="grid-3">
              <div class="field">
                <label>Estado</label>
                <select v-model="form.estado" class="f-select">
                  <option value="EN_REVISION">En revisión</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
              <div class="field">
                <label>Código MINTUR</label>
                <input :value="codigoMinturPreview" type="text" class="f-input" disabled />
              </div>
              <div class="field">
                <label>Código QT</label>
                <input :value="codigoQtPreview" type="text" class="f-input" disabled />
              </div>
            </div>

            <!-- 4-7. PARROQUIA, NODO, CENTRALIDAD -->
            <div class="grid-3">
              <div class="field">
                <label>Parroquia</label>
                <select v-model="form.cod_dpa" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="p in formCatalogData.parroquias" :key="p.id" :value="p.cod_dpa">
                    {{ p.dpa_descrip }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Nodo</label>
                <select v-model="form.cod_nodo" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="n in formCatalogData.nodos" :key="n.id" :value="n.cod_nodo">
                    {{ n.nodo_descrp }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Centralidad</label>
                <select v-model="form.cod_centralidad" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="c in formCatalogData.centralidades" :key="c.id" :value="c.cod_centralidad">
                    {{ c.centralidad_descrip }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 7-8. SUBCENTRALIDAD Y NOMBRE DEL ATRACTIVO / RECURSO -->
            <div class="grid-2">
              <div class="field">
                <label>Subcentralidad</label>
                <select v-model="form.cod_subcentralidad" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="s in formCatalogData.subcentralidades" :key="s.id_subcentralidad" :value="s.cod_subcentralidad">
                    {{ s.nombre }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Nombre del Atractivo / Recurso <span class="req">*</span></label>
                <input v-model="form.nombre" type="text" placeholder="Nombre del atractivo" class="f-input" />
              </div>
            </div>

            <!-- 9-11. CATEGORÍA, TIPO, SUB TIPO -->
            <div class="grid-3">
              <div class="field">
                <label>Categoría</label>
                <select v-model="form.cod_categoria" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="c in formCatalogData.categorias" :key="c.id" :value="c.cod_categoria">
                    {{ c.categoria_descrip }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Tipo</label>
                <select v-model="form.cod_tipo" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="t in formCatalogData.tipos" :key="t.id" :value="t.cod_tipo">
                    {{ t.tipo_descrip }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>Sub Tipo</label>
                <select v-model="form.cod_subtipo" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option v-for="s in formCatalogData.subtipos" :key="s.id" :value="s.cod_subtipo">
                    {{ s.subtipo_descrip }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 12-14. JERARQUÍA, PÚBLICA, PRIVADA -->
            <div class="grid-3">
              <div class="field">
                <label>Jerarquía</label>
                <select v-model="form.jerarquia" class="f-select">
                  <option value="0">Sin jerarquía</option>
                  <option value="1">I</option>
                  <option value="2">II</option>
                  <option value="3">III</option>
                  <option value="4">IV</option>
                </select>
              </div>
              <div class="field">
                <label>Pública</label>
                <select v-model="form.publica" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="field">
                <label>Privada</label>
                <select v-model="form.privada" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          <!-- TAB 2: UBICACIÓN -->
          <div class="form-section" v-if="activeTab === 'ubicacion'">
            <!-- MAPA -->
            <MapPicker
              :latitude="form.latitud"
              :longitude="form.longitud"
              :is-editing="!!editingItem"
              @update:latitude="form.latitud = $event"
              @update:longitude="form.longitud = $event"
            />

            <!-- BREVE DESCRIPCIÓN, SERVICIOS INCLUIDOS -->
            <h4 class="form-section-title" style="margin-top: 24px;">Descripción</h4>
            <div class="field">
              <label>Breve Descripción</label>
              <textarea v-model="form.breve_descripcion" rows="3" class="f-textarea" placeholder="Descripción breve del atractivo..."></textarea>
            </div>
            <div class="field">
              <label>Servicios Incluidos</label>
              <textarea v-model="form.servicios_incluidos" rows="2" class="f-textarea"></textarea>
            </div>
          </div>

          <!-- TAB 3: CONTACTOS -->
          <div class="form-section" v-if="activeTab === 'contactos'">
            <div class="grid-2">
              <div class="field">
                <label>Dirección</label>
                <input v-model="form.direccion" type="text" class="f-input" />
              </div>
              <div class="field">
                <label>Horario</label>
                <input v-model="form.horario" type="text" class="f-input" placeholder="Lun-Vie 08:00-17:00" />
              </div>
            </div>

            <div class="field">
              <label>Acceso de Transporte</label>
              <textarea v-model="form.acceso_de_transporte" rows="2" class="f-textarea"></textarea>
            </div>

            <div class="field">
              <label>Restricción a la Accesibilidad</label>
              <textarea v-model="form.restriccion_a_la_accesibilidad" rows="2" class="f-textarea"></textarea>
            </div>

            <div class="grid-1">
              <div class="field">
                <label>Pet Friendly</label>
                <select v-model="form.pet_friendly" class="f-select">
                  <option value="">Seleccionar...</option>
                  <option value="Si">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div class="field field--full">
              <label>Contacto - Teléfono / Correo Electrónico</label>
              <input v-model="form.contacto_telefono_correo_electronico" type="text" class="f-input" placeholder="Ej: +593 2 1234567 / contacto@atractivo.com" />
            </div>

            <div class="field field--full">
              <label>Manzana/Localidad del Atractivo</label>
              <input v-model="form.dpa_manzana_localidad_del_atractivo" type="text" class="f-input" placeholder="Ej: Manzana A, Lote 5 - Barrio Central" />
            </div>

            <div class="field field--full">
              <label>Observación de Inactivación</label>
              <textarea v-model="form.observacion_de_inactivacion" rows="2" class="f-textarea" placeholder="Motivo de inactivación si aplica"></textarea>
            </div>
          </div>
        </div>
      </div>
    </AppModal>

    <!-- Modal Ver Detalle -->
    <AppModal
      v-model="showViewModal"
      :title="viewingItem ? viewingItem.nombre : 'Detalle de Atractivo'"
      size="xl"
      :hide-footer="true"
      :close-on-backdrop="true"
    >
      <div v-if="viewingItem" class="view-grid">

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

        <!-- Identificación -->
        <div class="view-section">
          <h4 class="view-section-title">Identificación</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Nombre del Atractivo / Recurso</span><span class="vf-value">{{ viewingItem.nombre }}</span></div>
            <div class="view-field"><span class="vf-label">Jerarquía</span><span class="vf-value"><span class="stars"><span v-for="i in 4" :key="i" :class="['star', i <= viewingItem.jerarquia ? 'star-on' : 'star-off']">★</span></span></span></div>
            <div class="view-field"><span class="vf-label">Estado</span><span class="vf-value"><span class="badge" :class="badgeClass(viewingItem.estado)">{{ estadoLabel(viewingItem.estado) }}</span></span></div>
          </div>
        </div>

        <!-- Categorización -->
        <div class="view-section">
          <h4 class="view-section-title">Categorización</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Categoría</span><span class="vf-value">{{ viewingItem.categoria || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Tipo</span><span class="vf-value">{{ viewingItem.tipo || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Subtipo</span><span class="vf-value">{{ viewingItem.sub_tipo || '—' }}</span></div>
          </div>
        </div>

        <!-- Ubicación -->
        <div class="view-section">
          <h4 class="view-section-title">Ubicación</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Parroquia</span><span class="vf-value">{{ viewingItem.parroquia || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Dirección</span><span class="vf-value">{{ viewingItem.direccion || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Latitud</span><span class="vf-value">{{ viewingItem.latitud || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Longitud</span><span class="vf-value">{{ viewingItem.longitud || '—' }}</span></div>
          </div>
        </div>

        <!-- Códigos y Administración -->
        <div class="view-section">
          <h4 class="view-section-title">Códigos y Administración</h4>
          <div class="view-fields">
            <div class="view-field view-field--full"><span class="vf-label">Código QT</span><span class="vf-value">{{ viewingItem.codigo_qt || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Código MINTUR</span><span class="vf-value">{{ viewingItem.codigo_mintur || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Nodo</span><span class="vf-value">{{ viewingItem.nodo || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Centralidad</span><span class="vf-value">{{ viewingItem.centralidad || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Subcentralidad</span><span class="vf-value">{{ viewingItem.subcentralidad || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Zona</span><span class="vf-value">{{ viewingItem.zona || '—' }}</span></div>
          </div>
        </div>

        <!-- Facilidades -->
        <div class="view-section">
          <h4 class="view-section-title">Facilidades</h4>
          <div class="view-fields">
            <div class="view-field"><span class="vf-label">Pública</span><span class="vf-value">{{ viewingItem.publica || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Privada</span><span class="vf-value">{{ viewingItem.privada || '—' }}</span></div>
            <div class="view-field"><span class="vf-label">Pet friendly</span><span class="vf-value">{{ viewingItem.pet_friendly || '—' }}</span></div>
          </div>
        </div>

        <!-- Contacto -->
        <div class="view-section">
          <h4 class="view-section-title">Contacto</h4>
          <div class="view-fields">
            <div class="view-field view-field--full"><span class="vf-label">Contacto - Teléfono / Correo Electrónico</span><span class="vf-value">{{ viewingItem.contacto_telefono_correo_electronico || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Horario</span><span class="vf-value">{{ viewingItem.horario || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Manzana/Localidad del Atractivo</span><span class="vf-value">{{ viewingItem.dpa_manzana_localidad_del_atractivo || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Observación de inactivación</span><span class="vf-value">{{ viewingItem.observacion_de_inactivacion || '—' }}</span></div>
          </div>
        </div>

        <!-- Descripción -->
        <div class="view-section">
          <h4 class="view-section-title">Descripción</h4>
          <div class="view-fields">
            <div class="view-field view-field--full"><span class="vf-label">Breve descripción</span><span class="vf-value">{{ viewingItem.breve_descripcion || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Servicios incluidos</span><span class="vf-value">{{ viewingItem.servicios_incluidos || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Acceso de transporte</span><span class="vf-value">{{ viewingItem.acceso_de_transporte || '—' }}</span></div>
            <div class="view-field view-field--full"><span class="vf-label">Restricción a la accesibilidad</span><span class="vf-value">{{ viewingItem.restriccion_a_la_accesibilidad || '—' }}</span></div>
          </div>
        </div>


      </div>
    </AppModal>

    <!-- Modal Eliminar -->
    <AppModal
      v-model="showDeleteModal"
      title="Eliminar Atractivo"
      size="sm"
      :loading="deleting"
      :error="deleteError"
      save-label="Eliminar"
      :danger="true"
      @save="confirmDelete"
    >
      <p class="confirm-text">
        ¿Está seguro que desea eliminar el atractivo
        <strong>{{ deleteTarget?.nombre }}</strong>?
        Esta acción no se puede deshacer.
      </p>
    </AppModal>

    <!-- Toast de Éxito -->
    <Transition name="toast">
      <div v-if="showSuccess" class="toast-notification">
        <div class="toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="toast-message">{{ successMessage }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import AppTable from '@/components/AppTable.vue'
import AppModal from '@/components/AppModal.vue'
import MapPicker from '@/components/MapPicker.vue'
import { atractivosService } from '@/services/atractivos'
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
const showSuccess = ref(false)
const successMessage = ref('')

const formTabs = [
  { id: 'generales', label: 'Datos Generales' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'contactos', label: 'Contactos' },
]

const cats = reactive({
  categorias: [],
  tipos: [],
  parroquias: [],
  nodosCat: [],
  centralidadesCat: [],
  subcentralidadesCat: [],
  parroquiasCat: [],
  categoriasCat: [],
  tiposCat: [],
  subtiposCat: [],
  filterOptions: {
    categorias: [],
    parroquias: [],
    nodos: [],
    centralidades: [],
    subcentralidades: []
  }
})

const formCatalogData = reactive({
  parroquias: [],
  nodos: [],
  centralidades: [],
  subcentralidades: [],
  categorias: [],
  tipos: [],
  subtipos: []
})

const kpiCounts = reactive({ total: 0, activo: 0, inactivo: 0, en_revision: 0 })
const filters = reactive({ q: '', estado: '', id_categoria: '', id_parroquia: '', nodo: '', centralidad: '', subcentralidad: '', page: 1, limit: 15 })

const columns = [
  { key: 'id_atractivo',   label: 'N°',         width: '60px' },
  { key: 'codigo_qt',   label: 'Código',     width: '120px' },
  { key: 'nombre',   label: 'Nombre' },
  { key: 'categoria', label: 'Categoría', width: '140px' },
  { key: 'tipo',     label: 'Tipo',       width: '140px' },
  { key: 'parroquia', label: 'Parroquia', width: '140px' },
  { key: 'direccion', label: 'Dirección', width: '180px' },
  { key: 'estado',    label: 'Estado',    width: '120px' },
]

const emptyForm = () => ({
  codigo_mintur: '', codigo_qt: '',
  cod_dpa: '', cod_categoria: '', cod_nodo: '', cod_centralidad: '', cod_subcentralidad: '', cod_tipo: '', cod_subtipo: '',
  parroquia: '', nodo: '', centralidad: '', subcentralidad: '',
  categoria: '', tipo: '', sub_tipo: '',
  publica: '', privada: '',
  breve_descripcion: '', servicios_incluidos: '',
  acceso_de_transporte: '', restriccion_a_la_accesibilidad: '',
  pet_friendly: '',
  nombre: '',
  id_categoria: '', id_tipo: '', jerarquia: 0,
  id_parroquia: '',
  direccion: '',
  latitud: -0.2191000, longitud: -78.5107000,
  contacto_telefono_correo_electronico: '',
  dpa_manzana_localidad_del_atractivo: '',
  observacion_de_inactivacion: '',
  horario: '',
  estado: 'EN_REVISION',
})

const form = reactive(emptyForm())

const codigoQtBase = computed(() => [
  form.cod_dpa,
  form.cod_categoria,
  form.cod_nodo,
  form.cod_centralidad,
  form.cod_tipo,
  form.cod_subtipo,
].map((v) => (v || '').toString().trim()).join(''))

const codigoMinturBase = computed(() => [
  form.cod_dpa,
  form.cod_categoria,
  form.cod_tipo,
  form.cod_subtipo,
].map((v) => (v || '').toString().trim()).join(''))

const codigoQtPreview = computed(() => {
  if (codigoQtBase.value) {
    return editingItem.value
      ? `${codigoQtBase.value}${editingItem.value.id_atractivo}`
      : `${codigoQtBase.value}[ID]`
  }
  return form.codigo_qt || ''
})

const codigoMinturPreview = computed(() => {
  if (codigoMinturBase.value) {
    return editingItem.value
      ? `${codigoMinturBase.value}${editingItem.value.id_atractivo}`
      : `${codigoMinturBase.value}[ID]`
  }
  return form.codigo_mintur || ''
})

const mapEmbedUrl = computed(() => {
  const lat = viewingItem.value?.latitud
  const lng = viewingItem.value?.longitud
  if (!lat || !lng) return null
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
})

const tiposFiltrados = computed(() =>
  cats.tipos.filter((t) => !form.id_categoria || String(t.id_categoria) === String(form.id_categoria))
)

const zonas = computed(() => {
  const zonesFromItems = items.value
    .map(a => a.zona)
    .filter(Boolean)
  return [...new Set(zonesFromItems)].sort()
})

const activeFiltersCount = computed(() => {
  return [
    filters.estado,
    filters.id_categoria,
    filters.id_parroquia,
    filters.nodo,
    filters.centralidad,
    filters.subcentralidad,
  ].filter(Boolean).length
})

const allCentralidades = computed(() => {
  const centralidades = items.value
    .map(a => a.centralidad)
    .filter(Boolean)
  return [...new Set(centralidades)].sort()
})

// Métodos para obtener nombres de catálogos
const getParroquiaName = () => {
  if (!filters.id_parroquia) return '—'
  const p = cats.filterOptions.parroquias.find(x => x.id === parseInt(filters.id_parroquia))
  return p ? p.nombre : '—'
}

const getCategoryName = () => {
  if (!filters.id_categoria) return '—'
  const c = cats.filterOptions.categorias.find(x => x.id === parseInt(filters.id_categoria))
  return c ? c.nombre : '—'
}

const getTypeName = (codTipo) => {
  if (!codTipo || !cats.tipos) return '—'
  const t = cats.tipos.find(x => x.cod_tipo === codTipo)
  return t ? t.tipo_descrp : '—'
}

const getSubTypeName = (codSubtipo) => {
  if (!codSubtipo || !cats.subtipos) return '—'
  const s = cats.subtipos.find(x => x.cod_subtipo === codSubtipo)
  return s ? s.subtipo_descrp : '—'
}

const getNodoName = (codNodo) => {
  if (!codNodo || !cats.nodos) return '—'
  const n = cats.nodos.find(x => x.cod_nodo === codNodo)
  return n ? n.nodo_descrp : '—'
}

const getCentralidadName = (codCentralidad) => {
  if (!codCentralidad || !cats.centralidades) return '—'
  const c = cats.centralidades.find(x => x.cod_centralidad === codCentralidad)
  return c ? c.centralidad_descrp : '—'
}

// Funciones para mapear ID a COD
const getCodFromId = (idValue, catalogKey, idKey = 'id', codKey = 'cod') => {
  if (!idValue) return ''
  if (!cats[catalogKey]) {
    console.warn(`Catálogo ${catalogKey} no está cargado`)
    return ''
  }
  console.log(`Buscando ${idKey}=${idValue} en ${catalogKey}:`, cats[catalogKey])
  const item = cats[catalogKey].find(x => x[idKey] === idValue)
  console.log(`Resultado: ${codKey}=${item ? item[codKey] : 'NO ENCONTRADO'}`)
  return item ? item[codKey] : ''
}

const extractCodesFromCodigoQt = (codigoQt) => {
  if (!codigoQt || codigoQt.length < 16) return {}

  return {
    cod_dpa: codigoQt.substring(0, 6),        // 170103
    cod_categoria: codigoQt.substring(6, 8),  // MC
    cod_nodo: codigoQt.substring(8, 10),      // 01
    cod_centralidad: codigoQt.substring(10, 12), // 01
    cod_tipo: codigoQt.substring(12, 14),     // 01
    cod_subtipo: codigoQt.substring(14, 16),  // 01
  }
}

const mapIdsToCodsForForm = (payload) => {
  console.log('Payload recibido:', payload)

  // Intenta extraer códigos del código_qt (sin ID)
  let codesFromQt = {}
  if (payload.codigo_qt) {
    // Formato: DDDDDDCCNNCCTTSSOOIII donde DD=DPA(6), CC=CAT(2), NN=NODO(2), CC=CENTRAL(2), TT=TIPO(2), SS=SUBTIPO(2), OO=ORDEN(2-3), III=ID
    const codeStr = payload.codigo_qt
    codesFromQt = {
      cod_dpa: codeStr.substring(0, 6),        // 170103
      cod_categoria: codeStr.substring(6, 8),  // MC
      cod_nodo: codeStr.substring(8, 10),      // 01
      cod_centralidad: codeStr.substring(10, 12), // 01
      cod_tipo: codeStr.substring(12, 14),     // 01
      cod_subtipo: codeStr.substring(14, 16),  // 01
    }
  }

  // Usar códigos extraídos o campos existentes en payload
  const result = {
    cod_dpa: payload.cod_dpa || codesFromQt.cod_dpa || '',
    cod_categoria: payload.cod_categoria || codesFromQt.cod_categoria || '',
    cod_tipo: payload.cod_tipo || codesFromQt.cod_tipo || '',
    cod_nodo: payload.cod_nodo || codesFromQt.cod_nodo || '',
    cod_centralidad: payload.cod_centralidad || codesFromQt.cod_centralidad || '',
    cod_subcentralidad: payload.cod_subcentralidad || '',
    cod_subtipo: payload.cod_subtipo || codesFromQt.cod_subtipo || '',
  }
  console.log('Mapeo resultante:', result)
  return result
}

const syncFormDisplayValues = () => {
  console.log('=== SINCRONIZANDO VALORES DE DISPLAY ===')

  if (form.cod_subcentralidad && cats.subcentralidadesCat.length > 0) {
    const subCenItem = cats.subcentralidadesCat.find(s => s.cod_subcentralidad === form.cod_subcentralidad)
    console.log('Buscando subcentralidad:', form.cod_subcentralidad)
    console.log('Item encontrado:', subCenItem)
    if (subCenItem) {
      form.subcentralidad = subCenItem.nombre
      console.log('Subcentralidad sincronizada:', form.subcentralidad)
    } else {
      console.log('No se encontró subcentralidad en catálogo')
      console.log('Catálogo disponible:', cats.subcentralidadesCat)
    }
  }

  if (form.cod_categoria && cats.categoriasCat.length > 0) {
    const catItem = cats.categoriasCat.find(c => c.cod_categoria === form.cod_categoria)
    if (catItem) form.categoria = catItem.categoria_descrip
  }

  if (form.cod_nodo && cats.nodosCat.length > 0) {
    const nodoItem = cats.nodosCat.find(n => n.cod_nodo === form.cod_nodo)
    if (nodoItem) form.nodo = nodoItem.nodo_descrp
  }

  if (form.cod_centralidad && cats.centralidadesCat.length > 0) {
    const centralItem = cats.centralidadesCat.find(c => c.cod_centralidad === form.cod_centralidad)
    if (centralItem) form.centralidad = centralItem.nombre
  }

  if (form.cod_tipo && cats.tiposCat.length > 0) {
    const tipoItem = cats.tiposCat.find(t => t.cod_tipo === form.cod_tipo)
    if (tipoItem) form.tipo = tipoItem.tipo_descrip
  }

  if (form.cod_subtipo && cats.subtiposCat.length > 0) {
    const subtipoItem = cats.subtiposCat.find(s => s.cod_subtipo === form.cod_subtipo)
    if (subtipoItem) form.sub_tipo = subtipoItem.subtipo_descrip
  }
}

function parroquiasPorZona(zona) {
  return cats.parroquias.filter((p) => p.zona === zona)
}

async function fetchItems() {
  loading.value = true
  try {
    const { data } = await atractivosService.getAll({
      page: filters.page, limit: filters.limit,
      q: filters.q, estado: filters.estado, id_categoria: filters.id_categoria,
      id_parroquia: filters.id_parroquia, nodo: filters.nodo, centralidad: filters.centralidad, subcentralidad: filters.subcentralidad,
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
      atractivosService.getAll({ limit: 1 }),
      atractivosService.getAll({ limit: 1, estado: 'ACTIVO' }),
      atractivosService.getAll({ limit: 1, estado: 'INACTIVO' }),
      atractivosService.getAll({ limit: 1, estado: 'EN_REVISION' }),
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

function clearAllFilters() {
  filters.estado = ''
  filters.id_categoria = ''
  filters.id_parroquia = ''
  filters.nodo = ''
  filters.centralidad = ''
  filters.subcentralidad = ''
  filters.page = 1
  fetchFilterOptions()
  fetchItems()
}

async function fetchCatalogs() {
  const [cat, tip, par, nod, cen, subCen, parCat, catCat, tipCat, subCat] = await Promise.all([
    catalogosService.getCategorias(),
    catalogosService.getTipos(),
    catalogosService.getParroquias(),
    catalogosAdminService.getAll('nodo', { page: 1, limit: 500 }),
    catalogosAdminService.getAll('centralidad', { page: 1, limit: 500 }),
    catalogosAdminService.getAll('subcentralidad', { page: 1, limit: 500 }),
    catalogosAdminService.getAll('parroquia', { page: 1, limit: 500 }),
    catalogosAdminService.getAll('categoria', { page: 1, limit: 500 }),
    catalogosAdminService.getAll('tipo', { page: 1, limit: 500 }),
    catalogosAdminService.getAll('subtipo', { page: 1, limit: 500 }),
  ])
  cats.categorias = cat.data.data
  cats.tipos = tip.data.data
  cats.parroquias = par.data.data
  cats.nodosCat = nod.data.data
  cats.centralidadesCat = cen.data.data
  cats.subcentralidadesCat = subCen.data.data
  cats.parroquiasCat = parCat.data.data
  cats.categoriasCat = catCat.data.data
  cats.tiposCat = tipCat.data.data
  cats.subtiposCat = subCat.data.data
}

async function fetchFilterOptions() {
  try {
    const { data } = await atractivosService.getFilterOptions({
      estado: filters.estado,
      id_categoria: filters.id_categoria,
      id_parroquia: filters.id_parroquia,
      nodo: filters.nodo,
      centralidad: filters.centralidad,
      subcentralidad: filters.subcentralidad,
    })
    cats.filterOptions = data
    console.log('Filter options loaded:', cats.filterOptions)
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

async function openView(row) {
  try {
    const { data } = await atractivosService.getById(row.id_atractivo)
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
  // Cargar todos los catálogos para el formulario
  try {
    const [parr, nod, cen, subCen, cat, tip, subTip] = await Promise.all([
      catalogosAdminService.getAll('parroquia', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('nodo', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('centralidad', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('subcentralidad', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('categoria', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('tipo', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('subtipo', { page: 1, limit: 500 }),
    ])
    formCatalogData.parroquias = parr.data.data || []
    formCatalogData.nodos = nod.data.data || []
    formCatalogData.centralidades = cen.data.data || []
    formCatalogData.subcentralidades = subCen.data.data || []
    formCatalogData.categorias = cat.data.data || []
    formCatalogData.tipos = tip.data.data || []
    formCatalogData.subtipos = subTip.data.data || []
  } catch (err) {
    console.error('Error loading catalogs:', err)
  }
  showModal.value = true
}

async function openEdit(row) {
  modalError.value = ''
  activeTab.value = 'generales'
  try {
    // Cargar todos los catálogos para el formulario en paralelo con los datos del atractivo
    const [parr, nod, cen, subCen, cat, tip, subTip, { data }] = await Promise.all([
      catalogosAdminService.getAll('parroquia', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('nodo', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('centralidad', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('subcentralidad', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('categoria', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('tipo', { page: 1, limit: 500 }),
      catalogosAdminService.getAll('subtipo', { page: 1, limit: 500 }),
      atractivosService.getById(row.id_atractivo)
    ])
    formCatalogData.parroquias = parr.data.data || []
    formCatalogData.nodos = nod.data.data || []
    formCatalogData.centralidades = cen.data.data || []
    formCatalogData.subcentralidades = subCen.data.data || []
    formCatalogData.categorias = cat.data.data || []
    formCatalogData.tipos = tip.data.data || []
    formCatalogData.subtipos = subTip.data.data || []
    const payload = data.data || row
    console.log('=== OPEN EDIT ===')
    console.log('Payload:', payload)
    const codMappings = mapIdsToCodsForForm(payload)
    console.log('codMappings:', codMappings)
    const formData = {
      ...emptyForm(),
      ...payload,
      ...codMappings,
      accesible_movilidad: !!payload.accesible_movilidad,
      accesible_visual: !!payload.accesible_visual,
      accesible_auditiva: !!payload.accesible_auditiva,
      accesible_cognitiva: !!payload.accesible_cognitiva,
      senaletica: !!payload.senaletica,
      baterias_sanitarias: !!payload.baterias_sanitarias,
      estacionamiento: !!payload.estacionamiento,
    }
    console.log('formData antes de assign:', formData)
    Object.assign(form, formData)
    console.log('form después de assign:', form)
    console.log('form.cod_dpa:', form.cod_dpa)
    console.log('form.cod_categoria:', form.cod_categoria)
    console.log('form.cod_tipo:', form.cod_tipo)
    console.log('form.cod_subcentralidad:', form.cod_subcentralidad)
    console.log('form.subcentralidad:', form.subcentralidad)
    editingItem.value = row
    await nextTick()
    syncFormDisplayValues()
    showModal.value = true
  } catch (err) {
    modalError.value = err.response?.data?.error || 'Error al cargar el atractivo'
  }
}

function openDelete(row) {
  deleteTarget.value = row
  deleteError.value = ''
  showDeleteModal.value = true
}

async function handleSave() {
  if (!form.nombre) {
    modalError.value = 'El nombre del atractivo es obligatorio.'
    return
  }
  modalError.value = ''
  saving.value = true
  try {
    console.log('=== GUARDANDO ATRACTIVO ===')
    console.log('Subcentralidad a guardar:', form.subcentralidad)
    console.log('Cod_subcentralidad a guardar:', form.cod_subcentralidad)
    console.log('Formulario completo:', form)

    if (editingItem.value) {
      const response = await atractivosService.update(editingItem.value.id_atractivo, form)
      console.log('Respuesta update:', response)
      successMessage.value = response.data?.message || '✓ Atractivo actualizado correctamente'
    } else {
      const response = await atractivosService.create(form)
      console.log('Respuesta create:', response)
      successMessage.value = response.data?.message || '✓ Atractivo creado correctamente'
    }
    showSuccess.value = true
    showModal.value = false
    await new Promise(resolve => setTimeout(resolve, 1500))
    showSuccess.value = false
    fetchItems()
  } catch (err) {
    console.error('Error al guardar:', err)
    modalError.value = err.response?.data?.error || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  try {
    await atractivosService.remove(deleteTarget.value.id_atractivo)
    showDeleteModal.value = false
    fetchItems()
  } catch (err) {
    deleteError.value = err.response?.data?.error || 'Error al eliminar'
  } finally {
    deleting.value = false
  }
}

function badgeClass(estado) {
  return {
    ACTIVO: 'badge-success',
    INACTIVO: 'badge-gray',
    EN_REVISION: 'badge-warning',
  }[estado] || 'badge-gray'
}

function estadoLabel(estado) {
  return { ACTIVO: 'Activo', INACTIVO: 'Inactivo', EN_REVISION: 'En revisión' }[estado] || estado
}

onMounted(() => {
  fetchCatalogs()
  fetchFilterOptions()
  fetchKpis()
  fetchItems()
})

watch(() => filters.estado, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.id_categoria, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.id_parroquia, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.nodo, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.centralidad, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })
watch(() => filters.subcentralidad, () => { filters.page = 1; fetchFilterOptions(); fetchItems() })

// Sincronizar valores del generador de códigos con campos de texto
watch(() => form.cod_dpa, (newVal) => {
  const item = cats.parroquiasCat.find(p => p.cod_dpa === newVal)
  form.parroquia = item ? item.dpa_descrip : ''
})

watch(() => form.cod_categoria, (newVal) => {
  const item = cats.categoriasCat.find(c => c.cod_categoria === newVal)
  form.categoria = item ? item.categoria_descrip : ''
  // Sincronizar id_categoria desde cod_categoria
  const catItem = cats.categorias.find(c => c.id_categoria == newVal || String(c.id_categoria) === newVal)
  if (catItem) form.id_categoria = catItem.id_categoria
})

watch(() => form.cod_nodo, (newVal) => {
  const item = cats.nodosCat.find(n => n.cod_nodo === newVal)
  form.nodo = item ? item.nodo_descrp : ''
})

watch(() => form.cod_centralidad, (newVal) => {
  const item = cats.centralidadesCat.find(c => c.cod_centralidad === newVal)
  form.centralidad = item ? item.centralidad_descrip : ''
})

watch(() => form.cod_subcentralidad, (newVal) => {
  const item = cats.subcentralidadesCat.find(s => s.cod_subcentralidad === newVal)
  form.subcentralidad = item ? item.nombre : ''
})

watch(() => form.cod_tipo, (newVal) => {
  const item = cats.tiposCat.find(t => t.cod_tipo === newVal)
  form.tipo = item ? item.tipo_descrip : ''
  // Sincronizar id_tipo desde cod_tipo
  const typeItem = cats.tipos.find(t => t.id_tipo == newVal || String(t.id_tipo) === newVal)
  if (typeItem) form.id_tipo = typeItem.id_tipo
})

watch(() => form.cod_subtipo, (newVal) => {
  const item = cats.subtiposCat.find(s => s.cod_subtipo === newVal)
  form.sub_tipo = item ? item.subtipo_descrip : ''
})
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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 360px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
  background: white;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.search-input:focus { outline: none; border-color: #1a56a0; }

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

.filter-select:focus { outline: none; border-color: #1a56a0; }

.btn-create {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1.125rem;
  background: linear-gradient(135deg, #1a56a0, #2d7dd2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.btn-create:hover { opacity: 0.9; }
.btn-create svg { width: 16px; height: 16px; }

.cell-code { font-family: monospace; font-size: 0.8125rem; color: #4b5563; }

.cell-nombre { display: flex; flex-direction: column; }
.nombre-text { font-weight: 500; color: #111827; }
.nombre-sub { font-size: 0.75rem; color: #9ca3af; }

.stars { display: flex; gap: 1px; }
.star { font-size: 1rem; line-height: 1; }
.star-on { color: #f59e0b; }
.star-off { color: #d1d5db; }

.badge {
  display: inline-block;
  padding: 0.2rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success { background: #d1fae5; color: #065f46; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-gray    { background: #f3f4f6; color: #6b7280; }

.action-btns { display: flex; align-items: center; justify-content: center; gap: 0.375rem; }

.btn-icon {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon svg { width: 14px; height: 14px; }

.btn-edit { color: #1a56a0; }
.btn-edit:hover { background: #dbeafe; border-color: #1a56a0; }

.btn-delete { color: #dc2626; }
.btn-delete:hover { background: #fee2e2; border-color: #dc2626; }

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

.code-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.breakdown-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.breakdown-codes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
}

.breakdown-desc {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
}

.bd-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: center;
}

.bd-code {
  display: block;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  padding: 0.25rem;
  background: #f3f4f6;
  border-radius: 3px;
}

.bd-desc {
  display: block;
  font-size: 0.75rem;
  color: #4b5563;
  text-align: center;
  padding: 0.25rem;
}

.codigo-help {
  font-size: 0.7rem;
  color: #9ca3af;
  font-family: 'Monaco', 'Courier New', monospace;
  margin: 0;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 3px;
}

.code-fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.code-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cf-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.cf-value {
  display: block;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.cf-desc {
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 400;
  color: #6b7280;
}

@media (max-width: 768px) {
  .code-preview-container {
    grid-template-columns: 1fr;
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
.f-select:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }

.codigo-qt-help { margin: 0; font-size: 0.8125rem; color: #6b7280; }

.checkboxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; }

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

/* Code Generator */
.code-generator {
  padding: 1.25rem;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.code-gen-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a56a0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.25rem 0;
}

.f-input:disabled, .f-select:disabled {
  background: white;
  color: #374151;
  cursor: default;
  border-color: #d1d5db;
}

.field-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: 'Monaco', 'Courier New', monospace;
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

  .code-generator {
    padding: 1rem;
  }

  .code-generator .grid-3 {
    grid-template-columns: 1fr;
  }

  .code-generator .grid-2 {
    grid-template-columns: 1fr;
  }
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  z-index: 9999;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
  stroke: white;
}

.toast-message {
  font-weight: 500;
  font-size: 0.95rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
