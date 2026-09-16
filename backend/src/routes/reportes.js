const express = require('express')
const router = express.Router()
const { requireAuth, requirePermission } = require('../middleware/auth')
const {
  atractivosFields,
  experienciasFields,
  rutasFields,
  generateExcelFile
} = require('../utils/reportes')

router.get('/campos', requireAuth, requirePermission('REPORTES_VER'), (req, res) => {
  try {
    res.json({
      atractivos: atractivosFields,
      experiencias: experienciasFields,
      rutas: rutasFields
    })
  } catch (err) {
    console.error('Error en GET /reportes/campos:', err.message)
    res.status(500).json({ error: 'Error al obtener campos', details: err.message })
  }
})

router.post('/generar', requireAuth, requirePermission('REPORTES_VER'), async (req, res) => {
  try {
    const { modulos, campos, filtros } = req.body

    if (!modulos || modulos.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un módulo' })
    }

    const excelBuffer = await generateExcelFile(modulos, campos || {
      atractivos: [],
      experiencias: [],
      rutas: []
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${Date.now()}.xlsx"`)
    res.send(excelBuffer)
  } catch (err) {
    console.error('Error en POST /reportes/generar:', err.message)
    res.status(500).json({ error: 'Error al generar reporte', details: err.message })
  }
})

module.exports = router
