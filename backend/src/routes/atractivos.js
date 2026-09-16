const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth } = require('../middleware/auth')
const { registrarCambio } = require('../utils/auditoria')

function normalizeCode(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function buildCodigoQt(parts, n) {
  const items = [
    normalizeCode(parts.cod_dpa),
    normalizeCode(parts.cod_categoria),
    normalizeCode(parts.cod_nodo),
    normalizeCode(parts.cod_centralidad),
    normalizeCode(parts.cod_tipo),
    normalizeCode(parts.cod_subtipo),
  ]
  if (!n || items.some((item) => !item)) return null
  return `${items.join('')}${n}`
}

function buildCodigoMintur(parts, n) {
  const items = [
    normalizeCode(parts.cod_dpa),
    normalizeCode(parts.cod_categoria),
    normalizeCode(parts.cod_tipo),
    normalizeCode(parts.cod_subtipo),
  ]
  if (!n || items.some((item) => !item)) return null
  return `${items.join('')}${n}`
}

function formatOrden(value) {
  if (value === null || value === undefined) return null
  return String(value).padStart(3, '0')
}

// GET /api/atractivos
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 15, q = '', estado = '', id_categoria = '', id_parroquia = '', nodo = '', centralidad = '', subcentralidad = '' } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const where = ["a.estado != 'ELIMINADO'"]
    const params = []

    if (q) {
      where.push('(a.nombre LIKE ? OR a.codigo LIKE ? OR a.direccion LIKE ?)')
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }
    if (estado) { where.push('a.estado = ?'); params.push(estado) }
    if (id_categoria) { where.push('a.id_categoria = ?'); params.push(id_categoria) }
    if (id_parroquia) { where.push('a.id_parroquia = ?'); params.push(id_parroquia) }
    if (nodo) { where.push('a.nodo = ?'); params.push(nodo) }
    if (centralidad) { where.push('a.centralidad = ?'); params.push(centralidad) }
    if (subcentralidad) { where.push('a.subcentralidad = ?'); params.push(subcentralidad) }

    const whereClause = `WHERE ${where.join(' AND ')}`

    console.log('GET atractivos - Query:', whereClause)
    console.log('GET atractivos - Params:', params)

    const [rows] = await pool.query(
                  `SELECT a.*,
                    c.nombre AS categoria_nombre, t.nombre AS tipo_nombre,
                    p.nombre AS parroquia_nombre, p.zona
       FROM atractivos a
       LEFT JOIN cat_categorias c ON a.id_categoria = c.id_categoria
       LEFT JOIN cat_tipos t ON a.id_tipo = t.id_tipo
       LEFT JOIN cat_parroquias p ON a.id_parroquia = p.id_parroquia
       ${whereClause}
       ORDER BY a.id_atractivo DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    console.log('GET atractivos - Total filas:', rows.length)

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM atractivos a
       LEFT JOIN cat_parroquias p ON a.id_parroquia = p.id_parroquia
       ${whereClause}`,
      params
    )

    return res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error('ERROR en GET /:', err.message)
    console.error(err)
    return res.status(500).json({ error: 'Error al obtener atractivos', details: err.message })
  }
})

// GET /api/atractivos/filter-options
router.get('/filter-options', async (req, res) => {
  try {
    const { estado = '', id_categoria = '', id_parroquia = '', nodo = '', centralidad = '', subcentralidad = '' } = req.query

    // Construir WHERE dinámico basado en filtros actuales
    const whereConditions = ["a.estado != 'ELIMINADO'"]
    const params = []

    if (estado) { whereConditions.push('a.estado = ?'); params.push(estado) }
    if (id_categoria) { whereConditions.push('a.id_categoria = ?'); params.push(id_categoria) }
    if (id_parroquia) { whereConditions.push('a.id_parroquia = ?'); params.push(id_parroquia) }
    if (nodo) { whereConditions.push('a.nodo = ?'); params.push(nodo) }
    if (centralidad) { whereConditions.push('a.centralidad = ?'); params.push(centralidad) }
    if (subcentralidad) { whereConditions.push('a.subcentralidad = ?'); params.push(subcentralidad) }

    const whereClause = whereConditions.join(' AND ')

    // Obtener opciones dinámicas basadas en los filtros aplicados
    const [estados] = await pool.query(
      `SELECT DISTINCT a.estado FROM atractivos a
       WHERE ${whereClause} AND a.estado IS NOT NULL AND a.estado != ''
       ORDER BY a.estado`,
      params
    )

    const [categorias] = await pool.query(
      `SELECT DISTINCT a.id_categoria, c.nombre FROM atractivos a
       LEFT JOIN cat_categorias c ON a.id_categoria = c.id_categoria
       WHERE ${whereClause} AND a.id_categoria IS NOT NULL
       ORDER BY c.nombre`,
      params
    )

    const [parroquias] = await pool.query(
      `SELECT DISTINCT a.id_parroquia, p.dpa_descrip as nombre FROM atractivos a
       LEFT JOIN parroquia p ON a.id_parroquia = p.id
       WHERE ${whereClause} AND a.id_parroquia IS NOT NULL
       ORDER BY p.dpa_descrip`,
      params
    )

    const [nodos] = await pool.query(
      `SELECT DISTINCT a.nodo as nombre FROM atractivos a
       WHERE ${whereClause} AND (a.nodo IS NOT NULL AND a.nodo != '')
       ORDER BY a.nodo`,
      params
    )

    const [centralidades] = await pool.query(
      `SELECT DISTINCT a.centralidad as nombre FROM atractivos a
       WHERE ${whereClause} AND (a.centralidad IS NOT NULL AND a.centralidad != '')
       ORDER BY a.centralidad`,
      params
    )

    const [subcentralidades] = await pool.query(
      `SELECT DISTINCT a.subcentralidad as nombre FROM atractivos a
       WHERE ${whereClause} AND (a.subcentralidad IS NOT NULL AND a.subcentralidad != '')
       ORDER BY a.subcentralidad`,
      params
    )

    return res.json({
      estados: estados?.map(e => e.estado) || [],
      categorias: categorias?.map(c => ({ id: c.id_categoria, nombre: c.nombre })) || [],
      parroquias: parroquias?.map(p => ({ id: p.id_parroquia, nombre: p.nombre })) || [],
      nodos: nodos?.map(n => n.nombre) || [],
      centralidades: centralidades?.map(c => c.nombre) || [],
      subcentralidades: subcentralidades?.map(s => s.nombre) || []
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al obtener opciones de filtro' })
  }
})

// GET /api/atractivos/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*,
              c.nombre AS categoria_nombre, t.nombre AS tipo_nombre,
              p.nombre AS parroquia_nombre
       FROM atractivos a
       LEFT JOIN cat_categorias c ON a.id_categoria = c.id_categoria
       LEFT JOIN cat_tipos t ON a.id_tipo = t.id_tipo
       LEFT JOIN cat_parroquias p ON a.id_parroquia = p.id_parroquia
       WHERE a.id_atractivo = ? AND a.estado != 'ELIMINADO'`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Atractivo no encontrado' })
    const item = rows[0]
    item.orden = formatOrden(item.orden)
    return res.json({ data: item })
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener atractivo' })
  }
})

// POST /api/atractivos
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      orden,
      codigo_mintur, codigo_qt,
      parroquia: parroquia_text, nodo, centralidad, subcentralidad,
      categoria: categoria_text, tipo: tipo_text, sub_tipo,
      publica, privada,
      breve_descripcion, servicios_incluidos,
      acceso_de_transporte, restriccion_a_la_accesibilidad,
      pet_friendly, contacto_telefono_correo_electronico,
      dpa_manzana_localidad_del_atractivo, observacion_de_inactivacion,
      nombre, nombre_alternativo, id_categoria, id_tipo, jerarquia,
      id_parroquia, barrio, direccion, referencia,
      latitud, longitud, altitud_msnm,
      descripcion, historia, importancia,
      telefono, telefono_alt, email, sitio_web,
      horario, precio_entrada, precio_detalle,
      accesible_movilidad, accesible_visual, accesible_auditiva, accesible_cognitiva,
      accesibilidad_notas,
      senaletica, baterias_sanitarias, estacionamiento,
      estado, fecha_levantamiento, observaciones,
      cod_dpa, cod_categoria, cod_nodo, cod_centralidad, cod_tipo, cod_subtipo, cod_subcentralidad,
    } = req.body

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' })
    }

    // El número secuencial se genera automáticamente desde el id_atractivo
    // Obtener el siguiente ID para poder calcular el número formateado
    const [[{ nextId }]] = await pool.query(
      'SELECT MAX(id_atractivo) + 1 AS nextId FROM atractivos'
    )
    const nFormatted = String(nextId || 1).padStart(3, '0')

    const [result] = await pool.query(
      'INSERT INTO atractivos SET ?',
      [{
        nombre: nombre.trim(),
        nombre_alternativo: nombre_alternativo || null,
        id_categoria: id_categoria || null,
        id_tipo: id_tipo || null,
        jerarquia: jerarquia ?? 0,
        id_parroquia: id_parroquia || null,
        barrio: barrio || null,
        direccion: direccion || null,
        referencia: referencia || null,
        latitud: latitud || null,
        longitud: longitud || null,
        altitud_msnm: altitud_msnm || null,
        descripcion: descripcion || null,
        historia: historia || null,
        importancia: importancia || null,
        telefono: telefono || null,
        telefono_alt: telefono_alt || null,
        email: email || null,
        sitio_web: sitio_web || null,
        horario: horario || null,
        precio_entrada: precio_entrada || 'GRATUITO',
        precio_detalle: precio_detalle || null,
        accesible_movilidad: accesible_movilidad ? 1 : 0,
        accesible_visual: accesible_visual ? 1 : 0,
        accesible_auditiva: accesible_auditiva ? 1 : 0,
        accesible_cognitiva: accesible_cognitiva ? 1 : 0,
        accesibilidad_notas: accesibilidad_notas || null,
        senaletica: senaletica ? 1 : 0,
        baterias_sanitarias: baterias_sanitarias ? 1 : 0,
        estacionamiento: estacionamiento ? 1 : 0,
        estado: estado || 'EN_REVISION',
        fecha_levantamiento: fecha_levantamiento || null,
        observaciones: observaciones || null,
        parroquia: parroquia_text || null,
        nodo: nodo || null,
        centralidad: centralidad || null,
        subcentralidad: subcentralidad || null,
        cod_dpa: cod_dpa || null,
        cod_categoria: cod_categoria || null,
        cod_nodo: cod_nodo || null,
        cod_centralidad: cod_centralidad || null,
        cod_subcentralidad: cod_subcentralidad || null,
        cod_tipo: cod_tipo || null,
        cod_subtipo: cod_subtipo || null,
        categoria: categoria_text || null,
        tipo: tipo_text || null,
        sub_tipo: sub_tipo || null,
        publica: publica || null,
        privada: privada || null,
        breve_descripcion: breve_descripcion || null,
        servicios_incluidos: servicios_incluidos || null,
        acceso_de_transporte: acceso_de_transporte || null,
        restriccion_a_la_accesibilidad: restriccion_a_la_accesibilidad || null,
        pet_friendly: pet_friendly || null,
        contacto_telefono_correo_electronico: contacto_telefono_correo_electronico || null,
        dpa_manzana_localidad_del_atractivo: dpa_manzana_localidad_del_atractivo || null,
        observacion_de_inactivacion: observacion_de_inactivacion || null,
        creado_por: req.user.username,
      }]
    )

    const codigoQt = buildCodigoQt(
      { cod_dpa, cod_categoria, cod_nodo, cod_centralidad, cod_tipo, cod_subtipo },
      nFormatted
    )
    const codigoMintur = buildCodigoMintur(
      { cod_dpa, cod_categoria, cod_tipo, cod_subtipo },
      nFormatted
    )
    if (codigoQt) {
      await pool.query(
        'UPDATE atractivos SET codigo_qt = ? WHERE id_atractivo = ?',
        [codigoQt, result.insertId]
      )
    }
    if (codigoMintur) {
      await pool.query(
        'UPDATE atractivos SET codigo_mintur = ? WHERE id_atractivo = ?',
        [codigoMintur, result.insertId]
      )
    }

    // Registrar auditoría
    await registrarCambio('atractivos', result.insertId, 'CREATE', req.user, {}, req.body)

    return res.status(201).json({
      message: 'Atractivo creado correctamente',
      id: result.insertId,
      codigo_qt: codigoQt || codigo_qt || null,
      codigo_mintur: codigoMintur || codigo_mintur || null,
    })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El código ya existe' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Error al crear atractivo' })
  }
})

// PUT /api/atractivos/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const {
      orden,
      codigo_mintur, codigo_qt,
      parroquia: parroquia_text, nodo, centralidad, subcentralidad,
      categoria: categoria_text, tipo: tipo_text, sub_tipo,
      publica, privada,
      breve_descripcion, servicios_incluidos,
      acceso_de_transporte, restriccion_a_la_accesibilidad,
      pet_friendly, contacto_telefono_correo_electronico,
      dpa_manzana_localidad_del_atractivo, observacion_de_inactivacion,
      nombre, nombre_alternativo, id_categoria, id_tipo, jerarquia,
      id_parroquia, barrio, direccion, referencia,
      latitud, longitud, altitud_msnm,
      descripcion, historia, importancia,
      telefono, telefono_alt, email, sitio_web,
      horario, precio_entrada, precio_detalle,
      accesible_movilidad, accesible_visual, accesible_auditiva, accesible_cognitiva,
      accesibilidad_notas,
      senaletica, baterias_sanitarias, estacionamiento,
      estado, fecha_levantamiento, observaciones,
      cod_dpa, cod_categoria, cod_nodo, cod_centralidad, cod_tipo, cod_subcentralidad, cod_subtipo,
    } = req.body

    console.log('=== UPDATE ATRACTIVO ===')
    console.log('ID:', req.params.id)
    console.log('Subcentralidad recibida:', subcentralidad)
    console.log('Cod_subcentralidad recibida:', cod_subcentralidad)
    console.log('Datos completos:', req.body)

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' })
    }

    // Obtener datos antes de actualizar
    const [before] = await pool.query(
      'SELECT * FROM atractivos WHERE id_atractivo = ?',
      [req.params.id]
    )
    if (before.length === 0) {
      return res.status(404).json({ error: 'Atractivo no encontrado' })
    }
    const nFormatted = String(before[0].id_atractivo).padStart(3, '0')

    const [result] = await pool.query(
      'UPDATE atractivos SET ? WHERE id_atractivo = ?',
      [{
        nombre: nombre.trim(),
        nombre_alternativo: nombre_alternativo || null,
        id_categoria: id_categoria || null,
        id_tipo: id_tipo || null,
        jerarquia: jerarquia ?? 0,
        id_parroquia: id_parroquia || null,
        barrio: barrio || null,
        direccion: direccion || null,
        referencia: referencia || null,
        latitud: latitud || null,
        longitud: longitud || null,
        altitud_msnm: altitud_msnm || null,
        descripcion: descripcion || null,
        historia: historia || null,
        importancia: importancia || null,
        telefono: telefono || null,
        telefono_alt: telefono_alt || null,
        email: email || null,
        sitio_web: sitio_web || null,
        horario: horario || null,
        precio_entrada: precio_entrada || 'GRATUITO',
        precio_detalle: precio_detalle || null,
        accesible_movilidad: accesible_movilidad ? 1 : 0,
        accesible_visual: accesible_visual ? 1 : 0,
        accesible_auditiva: accesible_auditiva ? 1 : 0,
        accesible_cognitiva: accesible_cognitiva ? 1 : 0,
        accesibilidad_notas: accesibilidad_notas || null,
        senaletica: senaletica ? 1 : 0,
        baterias_sanitarias: baterias_sanitarias ? 1 : 0,
        estacionamiento: estacionamiento ? 1 : 0,
        estado: estado || 'EN_REVISION',
        fecha_levantamiento: fecha_levantamiento || null,
        observaciones: observaciones || null,
        parroquia: parroquia_text || null,
        nodo: nodo || null,
        centralidad: centralidad || null,
        subcentralidad: subcentralidad || null,
        cod_dpa: cod_dpa || null,
        cod_categoria: cod_categoria || null,
        cod_nodo: cod_nodo || null,
        cod_centralidad: cod_centralidad || null,
        cod_subcentralidad: cod_subcentralidad || null,
        cod_tipo: cod_tipo || null,
        cod_subtipo: cod_subtipo || null,
        categoria: categoria_text || null,
        tipo: tipo_text || null,
        sub_tipo: sub_tipo || null,
        publica: publica || null,
        privada: privada || null,
        breve_descripcion: breve_descripcion || null,
        servicios_incluidos: servicios_incluidos || null,
        acceso_de_transporte: acceso_de_transporte || null,
        restriccion_a_la_accesibilidad: restriccion_a_la_accesibilidad || null,
        pet_friendly: pet_friendly || null,
        contacto_telefono_correo_electronico: contacto_telefono_correo_electronico || null,
        dpa_manzana_localidad_del_atractivo: dpa_manzana_localidad_del_atractivo || null,
        observacion_de_inactivacion: observacion_de_inactivacion || null,
        actualizado_por: req.user.username,
      }, req.params.id]
    )

    const codigoQt = buildCodigoQt(
      { cod_dpa, cod_categoria, cod_nodo, cod_centralidad, cod_tipo, cod_subtipo },
      nFormatted
    )
    const codigoMintur = buildCodigoMintur(
      { cod_dpa, cod_categoria, cod_tipo, cod_subtipo },
      nFormatted
    )
    if (codigoQt) {
      await pool.query(
        'UPDATE atractivos SET codigo_qt = ? WHERE id_atractivo = ?',
        [codigoQt, req.params.id]
      )
    }
    if (codigoMintur) {
      await pool.query(
        'UPDATE atractivos SET codigo_mintur = ? WHERE id_atractivo = ?',
        [codigoMintur, req.params.id]
      )
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Atractivo no encontrado' })
    }

    // Registrar auditoría
    await registrarCambio('atractivos', req.params.id, 'UPDATE', req.user, before[0], req.body)

    return res.json({
      message: 'Atractivo actualizado correctamente',
      codigo_qt: codigoQt || codigo_qt || null,
      codigo_mintur: codigoMintur || codigo_mintur || null,
    })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El código ya existe' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Error al actualizar atractivo' })
  }
})

// DELETE /api/atractivos/:id (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Obtener datos antes de eliminar
    const [before] = await pool.query(
      'SELECT * FROM atractivos WHERE id_atractivo = ? AND estado != ?',
      [req.params.id, 'ELIMINADO']
    )
    if (before.length === 0) {
      return res.status(404).json({ error: 'Atractivo no encontrado' })
    }

    const [result] = await pool.query(
      `UPDATE atractivos SET estado = 'ELIMINADO', actualizado_por = ?
       WHERE id_atractivo = ? AND estado != 'ELIMINADO'`,
      [req.user.username, req.params.id]
    )

    // Registrar auditoría
    await registrarCambio('atractivos', req.params.id, 'DELETE', req.user, before[0], {})

    return res.json({ message: 'Atractivo eliminado correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al eliminar atractivo' })
  }
})

module.exports = router
