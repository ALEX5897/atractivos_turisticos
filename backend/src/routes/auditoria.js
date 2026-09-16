const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth, requirePermission } = require('../middleware/auth')

// GET /api/auditoria - Listado paginado con filtros
router.get('/', requireAuth, requirePermission('AUDITORIA_VER'), async (req, res) => {
  try {
    const { page = 1, limit = 20, tabla, usuario_id, tipo_accion, fecha_desde, fecha_hasta } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let whereConditions = []
    let params = []

    if (tabla) {
      whereConditions.push('tabla_afectada = ?')
      params.push(tabla)
    }
    if (usuario_id) {
      whereConditions.push('usuario_id = ?')
      params.push(usuario_id)
    }
    if (tipo_accion) {
      whereConditions.push('tipo_accion = ?')
      params.push(tipo_accion)
    }
    if (fecha_desde) {
      whereConditions.push('fecha_hora >= ?')
      params.push(fecha_desde)
    }
    if (fecha_hasta) {
      whereConditions.push('fecha_hora <= ?')
      params.push(fecha_hasta)
    }

    const whereSQL = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''

    // Obtener registros
    const limitParams = [...params, parseInt(limit), offset]
    const [rows] = await pool.query(
      `SELECT * FROM auditoria ${whereSQL} ORDER BY id DESC LIMIT ? OFFSET ?`,
      limitParams
    )

    // Contar total
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM auditoria ${whereSQL}`,
      params
    )

    res.json({
      data: rows,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (err) {
    console.error('ERROR en GET /auditoria:', err.message)
    res.status(500).json({ error: 'Error al obtener auditoría', details: err.message })
  }
})

// GET /api/auditoria/tabla/:tabla - Historial de una tabla específica
router.get('/tabla/:tabla', requireAuth, requirePermission('AUDITORIA_VER'), async (req, res) => {
  try {
    const { tabla } = req.params
    const { page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const [rows] = await pool.query(
      `SELECT * FROM auditoria
       WHERE tabla_afectada = ?
       ORDER BY fecha_hora DESC
       LIMIT ? OFFSET ?`,
      [tabla, parseInt(limit), offset]
    )

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM auditoria WHERE tabla_afectada = ?',
      [tabla]
    )

    res.json({
      data: rows,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (err) {
    console.error('ERROR en GET /auditoria/tabla/:tabla:', err.message)
    res.status(500).json({ error: 'Error al obtener historial de tabla', details: err.message })
  }
})

// GET /api/auditoria/registro/:tabla/:id - Historial de un registro específico
router.get('/registro/:tabla/:id', requireAuth, requirePermission('AUDITORIA_VER'), async (req, res) => {
  try {
    const { tabla, id } = req.params

    const [rows] = await pool.query(
      `SELECT * FROM auditoria
       WHERE tabla_afectada = ? AND registro_id = ?
       ORDER BY fecha_hora DESC`,
      [tabla, id]
    )

    res.json({ data: rows })
  } catch (err) {
    console.error('ERROR en GET /auditoria/registro:', err.message)
    res.status(500).json({ error: 'Error al obtener historial del registro', details: err.message })
  }
})

// GET /api/auditoria/usuario/:usuario_id - Cambios realizados por un usuario
router.get('/usuario/:usuario_id', requireAuth, requirePermission('AUDITORIA_VER'), async (req, res) => {
  try {
    const { usuario_id } = req.params
    const { page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const [rows] = await pool.query(
      `SELECT * FROM auditoria
       WHERE usuario_id = ?
       ORDER BY fecha_hora DESC
       LIMIT ? OFFSET ?`,
      [usuario_id, parseInt(limit), offset]
    )

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM auditoria WHERE usuario_id = ?',
      [usuario_id]
    )

    res.json({
      data: rows,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    })
  } catch (err) {
    console.error('ERROR en GET /auditoria/usuario:', err.message)
    res.status(500).json({ error: 'Error al obtener cambios del usuario', details: err.message })
  }
})

module.exports = router
