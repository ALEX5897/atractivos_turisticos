const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth } = require('../middleware/auth')

const TABLES = {
  nodo: {
    table: 'nodo',
    label: 'Nodos',
    id: 'id',
    columns: [
      { key: 'nodo_descrp', label: 'NODO_DESCRP' },
      { key: 'cod_nodo', label: 'COD_NODO' },
    ],
    filterWhereClause: 't.cod_nodo IS NOT NULL AND t.cod_nodo != ""',
  },
  centralidad: {
    table: 'centralidad',
    label: 'Centralidades',
    id: 'id',
    columns: [
      { key: 'centralidad_descrip', label: 'CENTRALIDAD_DESCRIP' },
      { key: 'cod_centralidad', label: 'COD_CENTRALIDAD' },
    ],
    filterWhereClause: 't.cod_centralidad IS NOT NULL AND t.cod_centralidad != ""',
  },
  parroquia: {
    table: 'parroquia',
    label: 'Parroquias (Catalogo)',
    id: 'id',
    columns: [
      { key: 'dpa_descrip', label: 'DPA_DESCRIP' },
      { key: 'cod_dpa', label: 'COD_DPA' },
    ],
    filterWhereClause: 't.cod_dpa IS NOT NULL AND t.cod_dpa != ""',
  },
  categoria: {
    table: 'categoria',
    label: 'Categorias (Catalogo)',
    id: 'id',
    columns: [
      { key: 'categoria_descrip', label: 'CATEGORIA_DESCRIP' },
      { key: 'cod_categoria', label: 'COD_CATEGORIA' },
    ],
    filterWhereClause: 't.cod_categoria IS NOT NULL AND t.cod_categoria != ""',
  },
  tipo: {
    table: 'tipo',
    label: 'Tipos (Catalogo)',
    id: 'id',
    columns: [
      { key: 'tipo_descrip', label: 'TIPO_DESCRIP' },
      { key: 'cod_tipo', label: 'COD_TIPO' },
    ],
    filterWhereClause: 't.cod_tipo IS NOT NULL AND t.cod_tipo != ""',
  },
  subtipo: {
    table: 'subtipo',
    label: 'Subtipos (Catalogo)',
    id: 'id',
    columns: [
      { key: 'subtipo_descrip', label: 'SUBTIPO_DESCRIP' },
      { key: 'cod_subtipo', label: 'COD_SUBTIPO' },
    ],
    filterWhereClause: 't.cod_subtipo IS NOT NULL AND t.cod_subtipo != ""',
  },
  modalidad: {
    table: 'modalidad',
    label: 'Modalidades',
    id: 'id',
    columns: [
      { key: 'modalidad_descrip', label: 'MODALIDAD_DESCRIP' },
      { key: 'cod_modalidad', label: 'COD_MODALIDAD' },
    ],
    filterWhereClause: 't.cod_modalidad IS NOT NULL AND t.cod_modalidad != ""',
  },
  subcentralidad: {
    table: 'cat_subcentralidades',
    label: 'Subcentralidades',
    id: 'id_subcentralidad',
    columns: [
      { key: 'nombre', label: 'NOMBRE' },
      { key: 'cod_subcentralidad', label: 'COD_SUBCENTRALIDAD' },
    ],
    filterWhereClause: 't.cod_subcentralidad IS NOT NULL AND t.cod_subcentralidad != ""',
  },
}

function getTableConfig(key) {
  return TABLES[key] || null
}

router.get('/tables', requireAuth, (_req, res) => {
  const tables = Object.entries(TABLES).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    id: cfg.id,
    columns: cfg.columns,
  }))
  return res.json({ data: tables })
})

router.get('/:table', requireAuth, async (req, res) => {
  const config = getTableConfig(req.params.table)
  if (!config) return res.status(404).json({ error: 'Catalogo no encontrado' })

  try {
    const { page = 1, limit = 15, q = '' } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const where = []
    const params = []

    // Agregar filtro de código si es requerido
    if (config.filterWhereClause) {
      where.push(config.filterWhereClause)
    }

    if (q) {
      const like = config.columns.map((c) => `t.${c.key} LIKE ?`).join(' OR ')
      where.push(`(${like})`)
      config.columns.forEach(() => params.push(`%${q}%`))
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const selectCols = [
      `t.${config.id} AS ${config.id}`,
      ...config.columns.map((c) => `t.${c.key} AS ${c.key}`),
    ].join(', ')

    const orderColumn = config.columns[0]?.key || config.id
    const [rows] = await pool.query(
      `SELECT ${selectCols}
       FROM ${config.table} t
       ${whereClause}
       ORDER BY t.${orderColumn} ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ${config.table} t ${whereClause}`,
      params
    )

    return res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al obtener catalogos' })
  }
})

router.post('/:table', requireAuth, async (req, res) => {
  const config = getTableConfig(req.params.table)
  if (!config) return res.status(404).json({ error: 'Catalogo no encontrado' })

  try {
    const fields = config.columns.map((c) => c.key)
    const values = fields.map((f) => req.body?.[f] ?? null)
    const colsSql = fields.map((f) => `\`${f}\``).join(', ')
    const placeholders = fields.map(() => '?').join(', ')
    const [result] = await pool.query(
      `INSERT INTO ${config.table} (${colsSql}) VALUES (${placeholders})`,
      values
    )
    return res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al crear catalogo' })
  }
})

router.put('/:table/:id', requireAuth, async (req, res) => {
  const config = getTableConfig(req.params.table)
  if (!config) return res.status(404).json({ error: 'Catalogo no encontrado' })

  try {
    const fields = config.columns.map((c) => c.key)
    const sets = fields.map((f) => `\`${f}\` = ?`).join(', ')
    const values = fields.map((f) => req.body?.[f] ?? null)
    values.push(req.params.id)

    await pool.query(
      `UPDATE ${config.table} SET ${sets} WHERE ${config.id} = ?`,
      values
    )
    return res.json({ message: 'Catalogo actualizado' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al actualizar catalogo' })
  }
})

router.delete('/:table/:id', requireAuth, async (req, res) => {
  const config = getTableConfig(req.params.table)
  if (!config) return res.status(404).json({ error: 'Catalogo no encontrado' })

  try {
    await pool.query(
      `DELETE FROM ${config.table} WHERE ${config.id} = ?`,
      [req.params.id]
    )
    return res.json({ message: 'Catalogo eliminado' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al eliminar catalogo' })
  }
})

module.exports = router
