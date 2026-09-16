const express = require('express')
const router = express.Router()
const { pool } = require('../config/database')
const { requireAuth } = require('../middleware/auth')

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [[{ atractivos }]] = await pool.query(
      `SELECT COUNT(*) AS atractivos FROM atractivos WHERE estado != 'ELIMINADO'`
    )
    const [[{ experiencias }]] = await pool.query(
      `SELECT COUNT(*) AS experiencias FROM experiencias
       WHERE estado_experiencia IS NULL OR estado_experiencia != 'ELIMINADO'`
    )
    const [[{ rutas }]] = await pool.query(
      `SELECT COUNT(*) AS rutas FROM rutas WHERE estado != 'ELIMINADO'`
    )
    const [por_estado] = await pool.query(
      `SELECT estado, COUNT(*) AS total FROM atractivos
       WHERE estado != 'ELIMINADO' GROUP BY estado`
    )
    const [por_categoria] = await pool.query(
      `SELECT c.nombre, COUNT(a.id_atractivo) AS total
       FROM cat_categorias c
       LEFT JOIN atractivos a
         ON c.id_categoria = a.id_categoria AND a.estado != 'ELIMINADO'
       GROUP BY c.id_categoria, c.nombre`
    )
    return res.json({ atractivos, experiencias, rutas, por_estado, por_categoria })
  } catch (err) {
    console.error('Error dashboard:', err)
    return res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

module.exports = router
