const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth } = require('../middleware/auth')
const { registrarCambio } = require('../utils/auditoria')

function formatOrden(value) {
  if (value === null || value === undefined) return null
  return String(value).padStart(3, '0')
}

// GET /api/experiencias
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 15, q = '', estado = '', parroquia = '', nodo = '', centralidad = '', modalidad = '' } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const where = ["(e.estado_experiencia IS NULL OR e.estado_experiencia != 'ELIMINADO')"]
    const params = []

    if (q) {
      where.push('(e.nombre LIKE ? OR e.codigo LIKE ? OR e.nombre_de_la_experiencia LIKE ?)')
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }
    if (estado) { where.push('e.estado_experiencia = ?'); params.push(estado) }
    if (parroquia) { where.push('e.parroquia = ?'); params.push(parroquia) }
    if (nodo) { where.push('e.nodo = ?'); params.push(nodo) }
    if (centralidad) { where.push('e.centralidad = ?'); params.push(centralidad) }
    if (modalidad) { where.push('e.modalidad = ?'); params.push(modalidad) }

    const whereClause = `WHERE ${where.join(' AND ')}`

    const [rows] = await pool.query(
                  `SELECT e.id_experiencia, e.n, e.estado_experiencia, e.codigo_experiencia_qt,
                    e.parroquia, e.nodo, e.centralidad, e.modalidad,
                    e.nombre_de_la_experiencia AS nombre,
                    e.modalidad AS tipo_experiencia,
                    e.breve_descripcion_y_actividades_a_realizar,
                    e.direccion, e.latitud, e.longitud,
                    e.tiempo_de_duracion, e.horario_de_atencion, e.costo,
                    e.capacidad, e.restricciones, e.contactos,
                    e.created_at, e.updated_at
       FROM experiencias e
       ${whereClause}
       ORDER BY e.id_experiencia DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM experiencias e ${whereClause}`,
      params
    )

    return res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al obtener experiencias', details: err.message })
  }
})

// GET /api/experiencias/filter-options
router.get('/filter-options', async (req, res) => {
  try {
    const { estado = '', parroquia = '', nodo = '', centralidad = '', modalidad = '' } = req.query

    // Construir WHERE dinámico basado en filtros actuales
    const whereConditions = ["(e.estado_experiencia IS NULL OR e.estado_experiencia != 'ELIMINADO')"]
    const params = []

    if (estado) { whereConditions.push('e.estado_experiencia = ?'); params.push(estado) }
    if (parroquia) { whereConditions.push('e.parroquia = ?'); params.push(parroquia) }
    if (nodo) { whereConditions.push('e.nodo = ?'); params.push(nodo) }
    if (centralidad) { whereConditions.push('e.centralidad = ?'); params.push(centralidad) }
    if (modalidad) { whereConditions.push('e.modalidad = ?'); params.push(modalidad) }

    const whereClause = whereConditions.join(' AND ')

    // Obtener opciones dinámicas basadas en los filtros aplicados
    const [estados] = await pool.query(
      `SELECT DISTINCT e.estado_experiencia FROM experiencias e
       WHERE ${whereClause} AND e.estado_experiencia IS NOT NULL AND e.estado_experiencia != ''
       ORDER BY e.estado_experiencia`,
      params
    )

    const [parroquias] = await pool.query(
      `SELECT DISTINCT e.parroquia as nombre FROM experiencias e
       WHERE ${whereClause} AND e.parroquia IS NOT NULL AND e.parroquia != ''
       ORDER BY e.parroquia`,
      params
    )

    const [nodos] = await pool.query(
      `SELECT DISTINCT e.nodo as nombre FROM experiencias e
       WHERE ${whereClause} AND e.nodo IS NOT NULL AND e.nodo != ''
       ORDER BY e.nodo`,
      params
    )

    const [centralidades] = await pool.query(
      `SELECT DISTINCT e.centralidad as nombre FROM experiencias e
       WHERE ${whereClause} AND e.centralidad IS NOT NULL AND e.centralidad != ''
       ORDER BY e.centralidad`,
      params
    )

    const [modalidades] = await pool.query(
      `SELECT DISTINCT e.modalidad as nombre FROM experiencias e
       WHERE ${whereClause} AND e.modalidad IS NOT NULL AND e.modalidad != ''
       ORDER BY e.modalidad`,
      params
    )

    return res.json({
      estados: estados?.map(e => e.estado_experiencia) || [],
      parroquias: parroquias?.map(p => p.nombre) || [],
      nodos: nodos?.map(n => n.nombre) || [],
      centralidades: centralidades?.map(c => c.nombre) || [],
      modalidades: modalidades?.map(m => m.nombre) || []
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al obtener opciones de filtro', details: err.message })
  }
})

// GET /api/experiencias/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM experiencias
       WHERE id_experiencia = ? AND (estado_experiencia IS NULL OR estado_experiencia != 'ELIMINADO')`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Experiencia no encontrada' })
    return res.json({ data: rows[0] })
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener experiencia', details: err.message })
  }
})

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

// Helper function to generate codigo_experiencia_qt
async function generateCodigoExperienciaQT(parroquia, modalidad, nodo, centralidad, nFormatted) {
  const codParroquia = await getCodeFromCatalog('parroquia', 'dpa_descrip', parroquia, 'cod_dpa') || ''
  const codModalidad = await getCodeFromCatalog('modalidad', 'modalidad_descrip', modalidad, 'cod_modalidad') || ''
  const codNodo = await getCodeFromCatalog('nodo', 'nodo_descrp', nodo, 'cod_nodo') || ''
  const codCentralidad = await getCodeFromCatalog('centralidad', 'centralidad_descrip', centralidad, 'cod_centralidad') || ''

  return `${codParroquia}${codModalidad}${codNodo}${codCentralidad}${nFormatted}`
}

// POST /api/experiencias
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      estado_experiencia, codigo_experiencia_qt,
      parroquia, nodo, centralidad, modalidad,
      parroquia_codigo, nodo_codigo, centralidad_codigo, modalidad_codigo,
      nombre_de_la_experiencia,
      breve_descripcion_y_actividades_a_realizar,
      direccion, latitud, longitud,
      tiempo_de_duracion, horario_de_atencion,
      costo, capacidad, restricciones, contactos,
      codigo, nombre
    } = req.body

    if (!nombre_de_la_experiencia) {
      return res.status(400).json({ error: 'Nombre de la experiencia es requerido' })
    }

    // Calcular el siguiente número secuencial
    const [[{ maxN }]] = await pool.query(
      'SELECT MAX(CAST(n AS SIGNED)) AS maxN FROM experiencias WHERE n IS NOT NULL'
    )
    const nextN = (maxN || 0) + 1
    const nFormatted = String(nextN).padStart(3, '0')

    // Usar códigos si se proporcionan, si no, buscar por nombre
    const codParroquia = parroquia_codigo || (await getCodeFromCatalog('parroquia', 'dpa_descrip', parroquia, 'cod_dpa'))
    const codModalidad = modalidad_codigo || (await getCodeFromCatalog('modalidad', 'modalidad_descrip', modalidad, 'cod_modalidad'))
    const codNodo = nodo_codigo || (await getCodeFromCatalog('nodo', 'nodo_descrp', nodo, 'cod_nodo'))
    const codCentralidad = centralidad_codigo || (await getCodeFromCatalog('centralidad', 'centralidad_descrip', centralidad, 'cod_centralidad'))

    // Generate codigo_experiencia_qt
    const generatedCodigoQT = `${codParroquia || ''}${codModalidad || ''}${codNodo || ''}${codCentralidad || ''}${nFormatted}`

    const [result] = await pool.query(
      'INSERT INTO experiencias SET ?',
      [{
        n: nFormatted,
        codigo: codigo || `EXP-${nFormatted}`,
        id_tipo_exp: req.body.id_tipo_exp || null,
        id_atractivo: req.body.id_atractivo || null,
        estado_experiencia: estado_experiencia || 'EN_REVISION',
        codigo_experiencia_qt: generatedCodigoQT,
        parroquia: parroquia || null,
        cod_parroquia: codParroquia || null,
        nodo: nodo || null,
        cod_nodo: codNodo || null,
        centralidad: centralidad || null,
        cod_centralidad: codCentralidad || null,
        modalidad: modalidad || null,
        cod_modalidad: codModalidad || null,
        nombre: nombre || nombre_de_la_experiencia,
        nombre_de_la_experiencia: nombre_de_la_experiencia,
        breve_descripcion_y_actividades_a_realizar: breve_descripcion_y_actividades_a_realizar || null,
        direccion: direccion || null,
        latitud: latitud || null,
        longitud: longitud || null,
        tiempo_de_duracion: tiempo_de_duracion || null,
        horario_de_atencion: horario_de_atencion || null,
        costo: costo || null,
        capacidad: capacidad || null,
        restricciones: restricciones || null,
        contactos: contactos || null,
        creado_por: req.user.username,
      }]
    )

    // Registrar auditoría
    await registrarCambio('experiencias', result.insertId, 'CREATE', req.user, {}, req.body)

    return res.status(201).json({
      message: 'Experiencia creada correctamente',
      id: result.insertId,
      n: nFormatted,
      codigo_experiencia_qt: generatedCodigoQT
    })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El código ya existe' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Error al crear experiencia', details: err.message })
  }
})

// PUT /api/experiencias/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const {
      estado_experiencia, codigo_experiencia_qt,
      parroquia, nodo, centralidad, modalidad,
      parroquia_codigo, nodo_codigo, centralidad_codigo, modalidad_codigo,
      nombre_de_la_experiencia,
      breve_descripcion_y_actividades_a_realizar,
      direccion, latitud, longitud,
      tiempo_de_duracion, horario_de_atencion,
      costo, capacidad, restricciones, contactos,
      codigo, nombre
    } = req.body

    if (!nombre_de_la_experiencia) {
      return res.status(400).json({ error: 'Nombre de la experiencia es requerido' })
    }

    // Obtener datos antes de actualizar
    const [before] = await pool.query(
      'SELECT * FROM experiencias WHERE id_experiencia = ?',
      [req.params.id]
    )

    if (before.length === 0) {
      return res.status(404).json({ error: 'Experiencia no encontrada' })
    }

    const nFormatted = before[0].n

    // Usar códigos si se proporcionan, si no, buscar por nombre
    const codParroquia = parroquia_codigo || (await getCodeFromCatalog('parroquia', 'dpa_descrip', parroquia, 'cod_dpa'))
    const codModalidad = modalidad_codigo || (await getCodeFromCatalog('modalidad', 'modalidad_descrip', modalidad, 'cod_modalidad'))
    const codNodo = nodo_codigo || (await getCodeFromCatalog('nodo', 'nodo_descrp', nodo, 'cod_nodo'))
    const codCentralidad = centralidad_codigo || (await getCodeFromCatalog('centralidad', 'centralidad_descrip', centralidad, 'cod_centralidad'))

    // Generate codigo_experiencia_qt
    const generatedCodigoQT = `${codParroquia || ''}${codModalidad || ''}${codNodo || ''}${codCentralidad || ''}${nFormatted}`

    const [result] = await pool.query(
      'UPDATE experiencias SET ? WHERE id_experiencia = ?',
      [{
        codigo: codigo || null,
        id_tipo_exp: req.body.id_tipo_exp || null,
        id_atractivo: req.body.id_atractivo || null,
        estado_experiencia: estado_experiencia || 'EN_REVISION',
        codigo_experiencia_qt: generatedCodigoQT,
        parroquia: parroquia || null,
        cod_parroquia: codParroquia || null,
        nodo: nodo || null,
        cod_nodo: codNodo || null,
        centralidad: centralidad || null,
        cod_centralidad: codCentralidad || null,
        modalidad: modalidad || null,
        cod_modalidad: codModalidad || null,
        nombre: nombre || nombre_de_la_experiencia,
        nombre_de_la_experiencia: nombre_de_la_experiencia,
        breve_descripcion_y_actividades_a_realizar: breve_descripcion_y_actividades_a_realizar || null,
        direccion: direccion || null,
        latitud: latitud || null,
        longitud: longitud || null,
        tiempo_de_duracion: tiempo_de_duracion || null,
        horario_de_atencion: horario_de_atencion || null,
        costo: costo || null,
        capacidad: capacidad || null,
        restricciones: restricciones || null,
        contactos: contactos || null,
        actualizado_por: req.user.username,
      }, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Experiencia no encontrada' })
    }

    // Registrar auditoría
    await registrarCambio('experiencias', req.params.id, 'UPDATE', req.user, before[0], req.body)

    return res.json({
      message: 'Experiencia actualizada correctamente',
      codigo_experiencia_qt: generatedCodigoQT
    })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El código ya existe' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Error al actualizar experiencia', details: err.message })
  }
})

// DELETE /api/experiencias/:id (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Obtener datos antes de eliminar
    const [before] = await pool.query(
      'SELECT * FROM experiencias WHERE id_experiencia = ? AND (estado_experiencia IS NULL OR estado_experiencia != ?)',
      [req.params.id, 'ELIMINADO']
    )
    if (before.length === 0) {
      return res.status(404).json({ error: 'Experiencia no encontrada' })
    }

    const [result] = await pool.query(
      `UPDATE experiencias SET estado_experiencia = 'ELIMINADO', actualizado_por = ?
       WHERE id_experiencia = ? AND (estado_experiencia IS NULL OR estado_experiencia != 'ELIMINADO')`,
      [req.user.username, req.params.id]
    )

    // Registrar auditoría
    await registrarCambio('experiencias', req.params.id, 'DELETE', req.user, before[0], {})

    return res.json({ message: 'Experiencia eliminada correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al eliminar experiencia', details: err.message })
  }
})

module.exports = router
