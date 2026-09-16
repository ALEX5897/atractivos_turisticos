const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth } = require('../middleware/auth')
const { registrarCambio } = require('../utils/auditoria')

function formatOrden(value) {
  if (value === null || value === undefined) return null
  return String(value).padStart(3, '0')
}

// Helper function to get code from catalog tables
async function getCodeFromCatalog(tableName, fieldName, value, codeFieldName) {
  if (!value) return null
  try {
    const query = `SELECT ${codeFieldName} as code FROM ${tableName} WHERE UPPER(${fieldName}) = UPPER(?)`
    const [rows] = await pool.query(query, [value])
    return rows.length > 0 ? rows[0].code : null
  } catch (err) {
    console.error(`Error fetching code from ${tableName}:`, err)
    return null
  }
}

// Helper function to generate codigo_qt for rutas
async function generateCodigoExperienciaQT(nodo, iniciales, centralidad, nFormatted) {
  const codNodo = await getCodeFromCatalog('nodo', 'nodo_descrp', nodo, 'cod_nodo') || ''
  const codCentralidad = await getCodeFromCatalog('centralidad', 'centralidad_descrip', centralidad, 'cod_centralidad') || ''
  const inicialesUpper = (iniciales || '').toUpperCase()

  return `${codNodo}${inicialesUpper}${codCentralidad}${nFormatted}`
}

// GET /api/rutas
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 15, q = '', estado = '', nodo = '', centralidad = '', modalidad = '' } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const where = ["r.estado != 'ELIMINADO'"]
    const params = []

    if (q) {
      where.push('(r.nombre LIKE ? OR r.codigo LIKE ?)')
      params.push(`%${q}%`, `%${q}%`)
    }
    if (estado) { where.push('r.estado = ?'); params.push(estado) }
    if (nodo) { where.push('r.nodo = ?'); params.push(nodo) }
    if (centralidad) { where.push('r.centralidad = ?'); params.push(centralidad) }
    if (modalidad) { where.push('r.modalidad = ?'); params.push(modalidad) }

    const whereClause = `WHERE ${where.join(' AND ')}`

    const [rows] = await pool.query(
                  `SELECT r.id_ruta, r.n, r.codigo, r.codigo_qt, r.nombre, r.dificultad, r.estado,
                    r.nodo, r.centralidad, r.clasificacion, r.modalidad,
                    r.tiempo_de_duracion_de_ruta_horas, r.distancia_km, r.altitud_m_s_n_m,
                    r.created_at, r.updated_at,
                    COALESCE(r.descripcion, r.breve_descripcion) AS descripcion, r.link_de_ruta,
                    r.establecimiento_a_b, r.observacion_de_inactivacion,
                    tr.nombre AS tipo_ruta
       FROM rutas r
       LEFT JOIN cat_tipos_ruta tr ON r.id_tipo_ruta = tr.id_tipo_ruta
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM rutas r ${whereClause}`,
      params
    )

    return res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al obtener rutas' })
  }
})

// GET /api/rutas/filter-options
router.get('/filter-options', async (req, res) => {
  try {
    const { estado = '', nodo = '', centralidad = '', modalidad = '' } = req.query

    // Construir WHERE dinámico basado en filtros actuales
    const whereConditions = ["r.estado != 'ELIMINADO'"]
    const params = []

    if (estado) { whereConditions.push('r.estado = ?'); params.push(estado) }
    if (nodo) { whereConditions.push('r.nodo = ?'); params.push(nodo) }
    if (centralidad) { whereConditions.push('r.centralidad = ?'); params.push(centralidad) }
    if (modalidad) { whereConditions.push('r.modalidad = ?'); params.push(modalidad) }

    const whereClause = whereConditions.join(' AND ')

    // Obtener opciones dinámicas basadas en los filtros aplicados
    const [estados] = await pool.query(
      `SELECT DISTINCT r.estado FROM rutas r
       WHERE ${whereClause} AND r.estado IS NOT NULL AND r.estado != ''
       ORDER BY r.estado`,
      params
    )

    const [nodos] = await pool.query(
      `SELECT DISTINCT r.nodo as nombre FROM rutas r
       WHERE ${whereClause} AND r.nodo IS NOT NULL AND r.nodo != ''
       ORDER BY r.nodo`,
      params
    )

    const [centralidades] = await pool.query(
      `SELECT DISTINCT r.centralidad as nombre FROM rutas r
       WHERE ${whereClause} AND r.centralidad IS NOT NULL AND r.centralidad != ''
       ORDER BY r.centralidad`,
      params
    )

    const [modalidades] = await pool.query(
      `SELECT DISTINCT r.modalidad as nombre FROM rutas r
       WHERE ${whereClause} AND r.modalidad IS NOT NULL AND r.modalidad != ''
       ORDER BY r.modalidad`,
      params
    )

    return res.json({
      estados: estados?.map(e => e.estado) || [],
      nodos: nodos?.map(n => n.nombre) || [],
      centralidades: centralidades?.map(c => c.nombre) || [],
      modalidades: modalidades?.map(m => m.nombre) || []
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al obtener opciones de filtro' })
  }
})

// GET /api/rutas/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, tr.nombre AS tipo_ruta_nombre
       FROM rutas r
       LEFT JOIN cat_tipos_ruta tr ON r.id_tipo_ruta = tr.id_tipo_ruta
       WHERE r.id_ruta = ? AND r.estado != 'ELIMINADO'`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Ruta no encontrada' })
    return res.json({ data: rows[0] })
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener ruta' })
  }
})

// POST /api/rutas
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      estado, nombre, iniciales_ruta,
      nodo, centralidad, clasificacion, modalidad,
      nodo_codigo, centralidad_codigo, modalidad_codigo,
      descripcion, tiempo_de_duracion_de_ruta_horas, distancia_km,
      dificultad, altitud_m_s_n_m, link_de_ruta,
      establecimiento_a_b, observacion_de_inactivacion,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_1,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_2,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_3,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_4,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_5,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_6,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_7,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_8,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_9,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_10,
    } = req.body

    if (!estado || !nombre) {
      return res.status(400).json({ error: 'Estado y nombre son requeridos' })
    }

    // Calcular el siguiente número secuencial
    const [[{ maxN }]] = await pool.query(
      'SELECT MAX(CAST(n AS SIGNED)) AS maxN FROM rutas WHERE n IS NOT NULL'
    )
    const nextN = (maxN || 0) + 1
    const nFormatted = String(nextN).padStart(3, '0')

    // Use codes if provided, otherwise search by name
    const codNodo = nodo_codigo || (await getCodeFromCatalog('nodo', 'nodo_descrp', nodo, 'cod_nodo'))
    const codCentralidad = centralidad_codigo || (await getCodeFromCatalog('centralidad', 'centralidad_descrip', centralidad, 'cod_centralidad'))
    const codModalidad = modalidad_codigo || (await getCodeFromCatalog('modalidad', 'modalidad_descrip', modalidad, 'cod_modalidad'))

    // Generate codigo_qt: codNodo + iniciales_ruta + codCentralidad + n
    const generatedCodigoQT = `${codNodo || ''}${(iniciales_ruta || '').toUpperCase()}${codCentralidad || ''}${nFormatted}`

    const [result] = await pool.query(
      'INSERT INTO rutas SET ?',
      [{
        n: nFormatted,
        codigo: generatedCodigoQT,
        codigo_qt: generatedCodigoQT,
        iniciales_ruta: iniciales_ruta || null,
        nodo: nodo || null,
        cod_nodo: codNodo || null,
        centralidad: centralidad || null,
        cod_centralidad: codCentralidad || null,
        clasificacion: clasificacion || null,
        modalidad: modalidad || null,
        cod_modalidad: codModalidad || null,
        descripcion: descripcion || null,
        tiempo_de_duracion_de_ruta_horas: tiempo_de_duracion_de_ruta_horas || null,
        distancia_km: distancia_km || null,
        dificultad: dificultad || 'FACIL',
        altitud_m_s_n_m: altitud_m_s_n_m || null,
        link_de_ruta: link_de_ruta || null,
        establecimiento_a_b: establecimiento_a_b || null,
        observacion_de_inactivacion: observacion_de_inactivacion || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_1: nombre_del_atractivo_recurso_asociado_a_la_ruta_1 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_2: nombre_del_atractivo_recurso_asociado_a_la_ruta_2 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_3: nombre_del_atractivo_recurso_asociado_a_la_ruta_3 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_4: nombre_del_atractivo_recurso_asociado_a_la_ruta_4 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_5: nombre_del_atractivo_recurso_asociado_a_la_ruta_5 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_6: nombre_del_atractivo_recurso_asociado_a_la_ruta_6 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_7: nombre_del_atractivo_recurso_asociado_a_la_ruta_7 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_8: nombre_del_atractivo_recurso_asociado_a_la_ruta_8 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_9: nombre_del_atractivo_recurso_asociado_a_la_ruta_9 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_10: nombre_del_atractivo_recurso_asociado_a_la_ruta_10 || null,
        nombre: nombre.trim(),
        id_tipo_ruta: 1,
        estado,
      }]
    )

    // Registrar auditoría
    await registrarCambio('rutas', result.insertId, 'CREATE', req.user, {}, req.body)

    return res.status(201).json({
      message: 'Ruta creada correctamente',
      id: result.insertId,
      n: nFormatted,
      codigo_qt: generatedCodigoQT
    })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El código ya existe' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Error al crear ruta' })
  }
})

// PUT /api/rutas/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const {
      estado, nombre, iniciales_ruta,
      nodo, centralidad, clasificacion, modalidad,
      nodo_codigo, centralidad_codigo, modalidad_codigo,
      descripcion, tiempo_de_duracion_de_ruta_horas, distancia_km,
      dificultad, altitud_m_s_n_m, link_de_ruta,
      establecimiento_a_b, observacion_de_inactivacion,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_1,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_2,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_3,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_4,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_5,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_6,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_7,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_8,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_9,
      nombre_del_atractivo_recurso_asociado_a_la_ruta_10,
    } = req.body

    if (!estado || !nombre) {
      return res.status(400).json({ error: 'Estado y nombre son requeridos' })
    }

    // Obtener datos antes de actualizar
    const [before] = await pool.query(
      'SELECT * FROM rutas WHERE id_ruta = ?',
      [req.params.id]
    )

    if (before.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' })
    }

    const nFormatted = before[0].n

    // Use codes if provided, otherwise search by name
    const codNodo = nodo_codigo || (await getCodeFromCatalog('nodo', 'nodo_descrp', nodo, 'cod_nodo'))
    const codCentralidad = centralidad_codigo || (await getCodeFromCatalog('centralidad', 'centralidad_descrip', centralidad, 'cod_centralidad'))
    const codModalidad = modalidad_codigo || (await getCodeFromCatalog('modalidad', 'modalidad_descrip', modalidad, 'cod_modalidad'))

    // Generate codigo_qt: codNodo + iniciales_ruta + codCentralidad + n
    const generatedCodigoQT = `${codNodo || ''}${(iniciales_ruta || '').toUpperCase()}${codCentralidad || ''}${nFormatted}`

    const [result] = await pool.query(
      'UPDATE rutas SET ? WHERE id_ruta = ?',
      [{
        codigo_qt: generatedCodigoQT,
        iniciales_ruta: iniciales_ruta || null,
        nodo: nodo || null,
        cod_nodo: codNodo || null,
        centralidad: centralidad || null,
        cod_centralidad: codCentralidad || null,
        clasificacion: clasificacion || null,
        modalidad: modalidad || null,
        cod_modalidad: codModalidad || null,
        descripcion: descripcion || null,
        tiempo_de_duracion_de_ruta_horas: tiempo_de_duracion_de_ruta_horas || null,
        distancia_km: distancia_km || null,
        dificultad: dificultad || 'FACIL',
        altitud_m_s_n_m: altitud_m_s_n_m || null,
        link_de_ruta: link_de_ruta || null,
        establecimiento_a_b: establecimiento_a_b || null,
        observacion_de_inactivacion: observacion_de_inactivacion || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_1: nombre_del_atractivo_recurso_asociado_a_la_ruta_1 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_2: nombre_del_atractivo_recurso_asociado_a_la_ruta_2 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_3: nombre_del_atractivo_recurso_asociado_a_la_ruta_3 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_4: nombre_del_atractivo_recurso_asociado_a_la_ruta_4 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_5: nombre_del_atractivo_recurso_asociado_a_la_ruta_5 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_6: nombre_del_atractivo_recurso_asociado_a_la_ruta_6 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_7: nombre_del_atractivo_recurso_asociado_a_la_ruta_7 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_8: nombre_del_atractivo_recurso_asociado_a_la_ruta_8 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_9: nombre_del_atractivo_recurso_asociado_a_la_ruta_9 || null,
        nombre_del_atractivo_recurso_asociado_a_la_ruta_10: nombre_del_atractivo_recurso_asociado_a_la_ruta_10 || null,
        nombre: nombre.trim(),
        id_tipo_ruta: 1,
        estado,
      }, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' })
    }

    // Registrar auditoría
    await registrarCambio('rutas', req.params.id, 'UPDATE', req.user, before[0], req.body)

    return res.json({
      message: 'Ruta actualizada correctamente',
      codigo_qt: generatedCodigoQT
    })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El código ya existe' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Error al actualizar ruta' })
  }
})

// DELETE /api/rutas/:id (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Obtener datos antes de eliminar
    const [before] = await pool.query(
      'SELECT * FROM rutas WHERE id_ruta = ? AND estado != ?',
      [req.params.id, 'ELIMINADO']
    )
    if (before.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' })
    }

    const [result] = await pool.query(
      `UPDATE rutas SET estado = 'ELIMINADO'
       WHERE id_ruta = ? AND estado != 'ELIMINADO'`,
      [req.params.id]
    )

    // Registrar auditoría
    await registrarCambio('rutas', req.params.id, 'DELETE', req.user, before[0], {})

    return res.json({ message: 'Ruta eliminada correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al eliminar ruta' })
  }
})

module.exports = router
