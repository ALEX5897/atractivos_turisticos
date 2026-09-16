// Mock para mysql2 pool
// Retorna datos fijos para tests sin conectar a la BD real

const mockRutas = [
  {
    id_ruta: 1,
    n: '001',
    codigo: '02RP08001',
    codigo_qt: '02RP08001',
    nombre: 'RUTA TEST 1',
    iniciales_nombre: 'RT',
    nodo: 'Nodo 1',
    centralidad: 'Central',
    clasificacion: 'Clasificación 1',
    modalidad: 'A Pie',
    descripcion: 'Descripción de prueba',
    breve_descripcion: 'Breve descripción',
    tiempo_de_duracion_de_ruta_horas: '2.5',
    distancia_km: '5.0',
    altitud_m_s_n_m: 2850,
    dificultad: 'FACIL',
    link_de_ruta: 'https://maps.google.com/...',
    estado: 'ACTIVO',
    establecimiento_a_b: 'Restaurant XYZ',
    observacion_de_inactivacion: null,
    created_at: '2026-05-21T10:00:00Z',
    updated_at: '2026-05-21T10:00:00Z'
  },
  {
    id_ruta: 2,
    n: '002',
    codigo: '02RP08002',
    codigo_qt: '02RP08002',
    nombre: 'RUTA TEST 2',
    iniciales_nombre: 'RT',
    nodo: 'Nodo 2',
    centralidad: 'Central',
    clasificacion: 'Clasificación 2',
    modalidad: 'Ciclo',
    descripcion: 'Otra descripción',
    breve_descripcion: 'Otra breve',
    tiempo_de_duracion_de_ruta_horas: '3.0',
    distancia_km: '8.5',
    altitud_m_s_n_m: 2900,
    dificultad: 'MODERADO',
    link_de_ruta: 'https://maps.google.com/...',
    estado: 'ACTIVO',
    establecimiento_a_b: null,
    observacion_de_inactivacion: null,
    created_at: '2026-05-21T11:00:00Z',
    updated_at: '2026-05-21T11:00:00Z'
  }
];

let nextId = 3;
let maxN = 2;
let routeData = JSON.parse(JSON.stringify(mockRutas)); // Deep copy

// Catálogos mock
const catalogos = {
  nodo: [
    { nodo_descrp: 'Nodo 1', cod_nodo: '02' },
    { nodo_descrp: 'Nodo 2', cod_nodo: '03' }
  ],
  centralidad: [
    { centralidad_descrip: 'Central', cod_centralidad: '08' },
    { centralidad_descrip: 'Periférica', cod_centralidad: '09' }
  ],
  modalidad: [
    { modalidad_descrip: 'A Pie', cod_modalidad: 'AP' },
    { modalidad_descrip: 'Ciclo', cod_modalidad: 'CI' }
  ]
};

const mockPool = {
  query: jest.fn(async (sql, params = []) => {
    // Debugging desactivado

    // COUNT queries - manejar primero porque pueden incluir SELECT
    if (sql.includes('COUNT(*)')) {
      let count = routeData.filter(r => r.estado !== 'ELIMINADO').length;
      return [[{ total: count }], null];
    }

    // GET MAX(n) para calcular siguiente número secuencial
    if (sql.includes('MAX(CAST(n') || sql.includes('MAX(n')) {
      return [[{ maxN }], null];
    }

    // GET by id - verificar estado no ELIMINADO
    // DEBE SER ANTES de DELETE pero debe ser específico para no capturar DELETE
    if ((sql.includes('SELECT') || sql.includes('SELECT r.*')) && sql.includes('WHERE r.id_ruta')) {
      const id = parseInt(params[0]);
      const route = routeData.find(r => r.id_ruta === id && r.estado !== 'ELIMINADO');
      return [route ? [route] : [], null];
    }

    // INSERT ruta
    if (sql.includes('INSERT INTO rutas')) {
      maxN++;
      const newRoute = { ...params[0], id_ruta: nextId, n: String(maxN).padStart(3, '0') };
      routeData.push(newRoute);
      const idToReturn = nextId;
      nextId++;
      return [{ insertId: idToReturn }, null];
    }

    // DELETE (soft delete) - DEBE SER ANTES de UPDATE general
    if (sql.includes('UPDATE rutas SET estado') && sql.includes('ELIMINADO')) {
      const id = parseInt(params[0]);
      const route = routeData.find(r => r.id_ruta === id);
      // Solo marcar como eliminado si existe Y no está ya eliminado
      if (route && route.estado !== 'ELIMINADO') {
        route.estado = 'ELIMINADO';
        return [{ affectedRows: 1 }, null];
      }
      return [{ affectedRows: 0 }, null];
    }

    // UPDATE ruta (general)
    if (sql.includes('UPDATE rutas SET') && sql.includes('WHERE')) {
      const id = parseInt(params[params.length - 1]);
      const updateData = params[0];
      const idx = routeData.findIndex(r => r.id_ruta === id);
      if (idx >= 0) {
        routeData[idx] = { ...routeData[idx], ...updateData };
        return [{ affectedRows: 1 }, null];
      }
      return [{ affectedRows: 0 }, null];
    }

    // SELECT de catálogo nodo con WHERE
    if (sql.includes('FROM nodo') && sql.includes('WHERE')) {
      const value = params[0];
      const result = catalogos.nodo.filter(n => n.nodo_descrp.toUpperCase() === value.toUpperCase());
      return [result.map(r => ({ code: r.cod_nodo })), null];
    }

    // SELECT de catálogo centralidad con WHERE
    if (sql.includes('FROM centralidad') && sql.includes('WHERE')) {
      const value = params[0];
      const result = catalogos.centralidad.filter(c => c.centralidad_descrip.toUpperCase() === value.toUpperCase());
      return [result.map(r => ({ code: r.cod_centralidad })), null];
    }

    // SELECT de catálogo modalidad con WHERE
    if (sql.includes('FROM modalidad') && sql.includes('WHERE')) {
      const value = params[0];
      const result = catalogos.modalidad.filter(m => m.modalidad_descrip.toUpperCase() === value.toUpperCase());
      return [result.map(r => ({ code: r.cod_modalidad })), null];
    }

    // SELECT rutas list
    if (sql.includes('SELECT') && sql.includes('FROM rutas')) {
      const limit = params[params.length - 1] || 15;
      const offset = params[params.length - 2] || 0;
      const filtered = routeData.filter(r => r.estado !== 'ELIMINADO');
      const data = filtered.slice(offset, offset + limit);
      return [data, null];
    }

    // SELECT catálogos sin WHERE
    if (sql.includes('FROM nodo') && !sql.includes('WHERE')) {
      return [catalogos.nodo, null];
    }

    if (sql.includes('FROM centralidad') && !sql.includes('WHERE')) {
      return [catalogos.centralidad, null];
    }

    if (sql.includes('FROM modalidad') && !sql.includes('WHERE')) {
      return [catalogos.modalidad, null];
    }

    // Default - retornar array vacío
    return [[], null];
  }),

  getConnection: jest.fn(async () => ({
    query: mockPool.query,
    release: jest.fn()
  })),

  reset: () => {
    routeData = JSON.parse(JSON.stringify(mockRutas));
    nextId = 3;
    maxN = 2;
  }
};

module.exports = mockPool;
