const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth } = require('../middleware/auth')

router.get('/categorias', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM cat_categorias WHERE activo = 1 ORDER BY nombre'
    )
    return res.json({ data: rows })
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener categorías' })
  }
})

router.get('/tipos', requireAuth, async (req, res) => {
  try {
    const { id_categoria } = req.query
    let sql = 'SELECT * FROM cat_tipos WHERE activo = 1'
    const params = []
    if (id_categoria) {
      sql += ' AND id_categoria = ?'
      params.push(id_categoria)
    }
    sql += ' ORDER BY nombre'
    const [rows] = await pool.query(sql, params)
    return res.json({ data: rows })
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener tipos' })
  }
})

router.get('/parroquias', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM cat_parroquias WHERE activo = 1 ORDER BY zona, nombre'
    )
    return res.json({ data: rows })
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener parroquias' })
  }
})

router.get('/administraciones-zonales', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM cat_administraciones_zonales WHERE activo = 1 ORDER BY nombre'
    )
    return res.json({ data: rows })
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener administraciones zonales' })
  }
})

router.get('/tipos-experiencia', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_tipo_exp as id, nombre FROM cat_tipos_experiencia ORDER BY nombre'
    )
    return res.json({ data: rows })
  } catch (err) {
    console.error('Error en /tipos-experiencia:', err.message)
    return res.status(500).json({ error: 'Error al obtener tipos de experiencia', details: err.message })
  }
})

router.get('/tipos-ruta', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_tipo_ruta as id, nombre FROM cat_tipos_ruta ORDER BY nombre'
    )
    return res.json({ data: rows })
  } catch (err) {
    console.error('Error en /tipos-ruta:', err.message)
    return res.status(500).json({ error: 'Error al obtener tipos de ruta', details: err.message })
  }
})

router.get('/atractivos-activos', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_atractivo, nombre FROM atractivos
       WHERE estado = 'ACTIVO' ORDER BY nombre`
    )
    return res.json({ data: rows })
  } catch (err) {
    console.error('Error en /atractivos-activos:', err.message)
    return res.status(500).json({ error: 'Error al obtener atractivos', details: err.message })
  }
})

router.get('/nodos', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT cod_nodo as codigo, nodo_descrp as nombre FROM nodo WHERE activo = 1 ORDER BY nodo_descrp'
    )
    return res.json({ data: rows })
  } catch (err) {
    console.error('Error en /nodos:', err.message)
    return res.status(500).json({ error: 'Error al obtener nodos', details: err.message })
  }
})

router.get('/centralidades', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT cod_centralidad as codigo, centralidad_descrip as nombre FROM centralidad WHERE activo = 1 ORDER BY centralidad_descrip'
    )
    return res.json({ data: rows })
  } catch (err) {
    console.error('Error en /centralidades:', err.message)
    return res.status(500).json({ error: 'Error al obtener centralidades', details: err.message })
  }
})

router.get('/modalidades', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT cod_modalidad as codigo, modalidad_descrip as nombre FROM modalidad WHERE activo = 1 ORDER BY modalidad_descrip'
    )
    return res.json({ data: rows })
  } catch (err) {
    console.error('Error en /modalidades:', err.message)
    return res.status(500).json({ error: 'Error al obtener modalidades', details: err.message })
  }
})

router.get('/subcentralidades', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT cod_subcentralidad as codigo, subcentralidad_descrip as nombre FROM subcentralidad WHERE activo = 1 ORDER BY subcentralidad_descrip'
    )
    return res.json({ data: rows })
  } catch (err) {
    console.error('Error en /subcentralidades:', err.message)
    return res.status(500).json({ error: 'Error al obtener subcentralidades', details: err.message })
  }
})

module.exports = router
