const { pool } = require('../config/database')
const XLSX = require('xlsx')

const atractivosFields = [
  { key: 'id_atractivo', label: 'ID', mostSel: false },
  { key: 'codigo_qt', label: 'Código QT', mostSel: true },
  { key: 'codigo_mintur', label: 'Código MINTUR', mostSel: false },
  { key: 'nombre', label: 'Nombre', mostSel: true },
  { key: 'categoria_nombre', label: 'Categoría', mostSel: true },
  { key: 'tipo_nombre', label: 'Tipo', mostSel: true },
  { key: 'jerarquia', label: 'Jerarquía', mostSel: false },
  { key: 'parroquia_nombre', label: 'Parroquia', mostSel: true },
  { key: 'zona', label: 'Zona', mostSel: true },
  { key: 'barrio', label: 'Barrio', mostSel: true },
  { key: 'direccion', label: 'Dirección', mostSel: true },
  { key: 'latitud', label: 'Latitud', mostSel: false },
  { key: 'longitud', label: 'Longitud', mostSel: false },
  { key: 'altitud_msnm', label: 'Altitud (m.s.n.m)', mostSel: false },
  { key: 'precio_entrada', label: 'Precio Entrada', mostSel: true },
  { key: 'horario', label: 'Horario', mostSel: false },
  { key: 'telefono', label: 'Teléfono', mostSel: false },
  { key: 'email', label: 'Email', mostSel: false },
  { key: 'accesible_movilidad', label: 'Accesible Movilidad', mostSel: false },
  { key: 'accesible_visual', label: 'Accesible Visual', mostSel: false },
  { key: 'accesible_auditiva', label: 'Accesible Auditiva', mostSel: false },
  { key: 'accesible_cognitiva', label: 'Accesible Cognitiva', mostSel: false },
  { key: 'estado', label: 'Estado', mostSel: true },
  { key: 'created_at', label: 'Creado', mostSel: false },
  { key: 'updated_at', label: 'Actualizado', mostSel: false }
]

const experienciasFields = [
  { key: 'id_experiencia', label: 'ID', mostSel: false },
  { key: 'codigo_experiencia_qt', label: 'Código QT', mostSel: true },
  { key: 'nombre_de_la_experiencia', label: 'Nombre', mostSel: true },
  { key: 'parroquia', label: 'Parroquia', mostSel: true },
  { key: 'nodo', label: 'Nodo', mostSel: true },
  { key: 'centralidad', label: 'Centralidad', mostSel: false },
  { key: 'modalidad', label: 'Modalidad', mostSel: true },
  { key: 'tiempo_de_duracion', label: 'Duración', mostSel: true },
  { key: 'costo', label: 'Costo', mostSel: true },
  { key: 'horario_de_atencion', label: 'Horario', mostSel: true },
  { key: 'capacidad', label: 'Capacidad', mostSel: true },
  { key: 'operador_nombre', label: 'Operador', mostSel: true },
  { key: 'operador_telefono', label: 'Teléfono Operador', mostSel: false },
  { key: 'operador_email', label: 'Email Operador', mostSel: false },
  { key: 'accesible', label: 'Accesible', mostSel: false },
  { key: 'estado_experiencia', label: 'Estado', mostSel: true },
  { key: 'created_at', label: 'Creado', mostSel: false },
  { key: 'updated_at', label: 'Actualizado', mostSel: false }
]

const rutasFields = [
  { key: 'id_ruta', label: 'ID', mostSel: false },
  { key: 'codigo_qt', label: 'Código QT', mostSel: true },
  { key: 'nombre', label: 'Nombre', mostSel: true },
  { key: 'tipo_ruta', label: 'Tipo Ruta', mostSel: true },
  { key: 'dificultad', label: 'Dificultad', mostSel: true },
  { key: 'tiempo_de_duracion_de_ruta_horas', label: 'Duración (hrs)', mostSel: true },
  { key: 'distancia_km', label: 'Distancia (km)', mostSel: true },
  { key: 'nodo', label: 'Nodo', mostSel: true },
  { key: 'centralidad', label: 'Centralidad', mostSel: true },
  { key: 'modalidad', label: 'Modalidad', mostSel: true },
  { key: 'altitud_m_s_n_m', label: 'Altitud (m.s.n.m)', mostSel: false },
  { key: 'punto_inicio_nombre', label: 'Punto Inicio', mostSel: false },
  { key: 'punto_fin_nombre', label: 'Punto Fin', mostSel: false },
  { key: 'accesible', label: 'Accesible', mostSel: false },
  { key: 'descripcion', label: 'Descripción', mostSel: false },
  { key: 'estado', label: 'Estado', mostSel: true },
  { key: 'created_at', label: 'Creado', mostSel: false },
  { key: 'updated_at', label: 'Actualizado', mostSel: false }
]

async function getAtractivosData(camposSeleccionados, filtros = {}) {
  try {
    let query = `SELECT a.id_atractivo, a.codigo_qt, a.codigo_mintur, a.nombre,
                        a.jerarquia, a.barrio, a.direccion, a.latitud, a.longitud,
                        a.altitud_msnm, a.precio_entrada, a.horario, a.telefono, a.email,
                        a.accesible_movilidad, a.accesible_visual, a.accesible_auditiva, a.accesible_cognitiva,
                        a.estado, a.created_at, a.updated_at,
                        c.nombre AS categoria_nombre, t.nombre AS tipo_nombre, p.nombre AS parroquia_nombre, p.zona
                 FROM atractivos a
                 LEFT JOIN cat_categorias c ON a.id_categoria = c.id_categoria
                 LEFT JOIN cat_tipos t ON a.id_tipo = t.id_tipo
                 LEFT JOIN cat_parroquias p ON a.id_parroquia = p.id_parroquia
                 WHERE a.estado != 'ELIMINADO'`

    if (filtros.estado) {
      query += ` AND a.estado = ?`
      const [rows] = await pool.query(query, [filtros.estado])
      return rows
    }

    query += ` ORDER BY a.id_atractivo`
    const [rows] = await pool.query(query)
    return rows
  } catch (err) {
    console.error('Error getting atractivos data:', err.message)
    return []
  }
}

async function getExperienciasData(camposSeleccionados, filtros = {}) {
  try {
    let query = `SELECT e.*
                 FROM experiencias e
                 WHERE e.estado_experiencia IS NOT NULL AND e.estado_experiencia != '' AND e.estado_experiencia != 'ELIMINADO'`

    if (filtros.estado) {
      query += ` AND e.estado_experiencia = ?`
      const [rows] = await pool.query(query, [filtros.estado])
      return rows
    }

    query += ` ORDER BY e.id_experiencia`
    const [rows] = await pool.query(query)
    return rows
  } catch (err) {
    console.error('Error getting experiencias data:', err.message)
    return []
  }
}

async function getRutasData(camposSeleccionados, filtros = {}) {
  try {
    let query = `SELECT r.id_ruta, r.codigo_qt, r.nombre, r.dificultad, r.estado,
                        r.nodo, r.centralidad, r.modalidad,
                        r.tiempo_de_duracion_de_ruta_horas, r.distancia_km,
                        r.altitud_m_s_n_m, r.punto_inicio_nombre, r.punto_fin_nombre,
                        r.accesible, r.descripcion, r.created_at, r.updated_at,
                        tr.nombre AS tipo_ruta
                 FROM rutas r
                 LEFT JOIN cat_tipos_ruta tr ON r.id_tipo_ruta = tr.id_tipo_ruta
                 WHERE r.estado != 'ELIMINADO'`

    if (filtros.estado) {
      query += ` AND r.estado = ?`
      const [rows] = await pool.query(query, [filtros.estado])
      return rows
    }

    query += ` ORDER BY r.id_ruta`
    const [rows] = await pool.query(query)
    return rows
  } catch (err) {
    console.error('Error getting rutas data:', err.message)
    return []
  }
}

function filterColumns(data, selectedFields) {
  return data.map(row => {
    const filtered = {}
    selectedFields.forEach(field => {
      filtered[field] = row[field] || ''
    })
    return filtered
  })
}

function getFieldLabels(selectedFields, allFields) {
  const labels = {}
  allFields.forEach(field => {
    if (selectedFields.includes(field.key)) {
      labels[field.key] = field.label
    }
  })
  return labels
}

function calculateStats(data, stateKey) {
  const stats = {
    total: data.length,
    byState: {}
  }

  data.forEach(row => {
    const state = row[stateKey] || 'SIN_ESTADO'
    stats.byState[state] = (stats.byState[state] || 0) + 1
  })

  return stats
}

function createStyledSheet(workbook, sheetName, data, fieldLabels) {
  const wsData = []

  const headerRow = Object.values(fieldLabels)
  wsData.push(headerRow)

  data.forEach(row => {
    const rowData = Object.keys(fieldLabels).map(key => row[key] || '')
    wsData.push(rowData)
  })

  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws['!cols'] = headerRow.map(() => ({ wch: 20 }))

  for (let i = 0; i < headerRow.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i })
    if (!ws[cellRef]) ws[cellRef] = {}
    ws[cellRef].fill = { patternType: 'solid', fgColor: { rgb: '4472C4' } }
    ws[cellRef].font = { bold: true, color: { rgb: 'FFFFFF' } }
    ws[cellRef].alignment = { horizontal: 'center', vertical: 'center', wrapText: true }
  }

  for (let i = 1; i < wsData.length; i++) {
    for (let j = 0; j < headerRow.length; j++) {
      const cellRef = XLSX.utils.encode_cell({ r: i, c: j })
      if (!ws[cellRef]) ws[cellRef] = {}
      ws[cellRef].border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      if (i % 2 === 0) {
        ws[cellRef].fill = { patternType: 'solid', fgColor: { rgb: 'F2F2F2' } }
      }
    }
  }

  workbook.SheetNames.push(sheetName)
  workbook.Sheets[sheetName] = ws
}

function createKPIsSheet(workbook, allData) {
  const wsData = []

  wsData.push(['RESUMEN DE REPORTES - KPIs'])
  wsData.push([])

  let row = 2
  Object.keys(allData).forEach(modulo => {
    const data = allData[modulo].data
    const stats = allData[modulo].stats
    const stateKey = modulo === 'experiencias' ? 'estado_experiencia' : 'estado'

    wsData[row] = [modulo.toUpperCase()]
    row++

    wsData[row] = ['Total de Registros:', stats.total]
    row++

    wsData[row] = ['Estado', 'Cantidad']
    row++

    Object.keys(stats.byState).forEach(state => {
      wsData[row] = [state, stats.byState[state]]
      row++
    })

    wsData[row] = []
    row++
  })

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }]

  if (!ws['A1']) ws['A1'] = {}
  ws['A1'].font = { bold: true, size: 14 }
  ws['A1'].fill = { patternType: 'solid', fgColor: { rgb: '4472C4' } }
  ws['A1'].font.color = { rgb: 'FFFFFF' }

  workbook.SheetNames.push('KPIs')
  workbook.Sheets['KPIs'] = ws
}

async function generateExcelFile(modulos, campos) {
  const workbook = {
    SheetNames: [],
    Sheets: {}
  }

  const allData = {}

  try {
    for (const modulo of modulos) {
      let data = []
      let fieldLabels = {}
      let stats = {}

      if (modulo === 'atractivos') {
        data = await getAtractivosData(campos.atractivos)
        const selected = filterColumns(data, campos.atractivos)
        fieldLabels = getFieldLabels(campos.atractivos, atractivosFields)
        stats = calculateStats(data, 'estado')

        createStyledSheet(workbook, 'Atractivos', selected, fieldLabels)
        allData.atractivos = { data: selected, stats, stateKey: 'estado' }
      } else if (modulo === 'experiencias') {
        data = await getExperienciasData(campos.experiencias)
        const selected = filterColumns(data, campos.experiencias)
        fieldLabels = getFieldLabels(campos.experiencias, experienciasFields)
        stats = calculateStats(data, 'estado_experiencia')

        createStyledSheet(workbook, 'Experiencias', selected, fieldLabels)
        allData.experiencias = { data: selected, stats, stateKey: 'estado_experiencia' }
      } else if (modulo === 'rutas') {
        data = await getRutasData(campos.rutas)
        const selected = filterColumns(data, campos.rutas)
        fieldLabels = getFieldLabels(campos.rutas, rutasFields)
        stats = calculateStats(data, 'estado')

        createStyledSheet(workbook, 'Rutas', selected, fieldLabels)
        allData.rutas = { data: selected, stats, stateKey: 'estado' }
      }
    }

    createKPIsSheet(workbook, allData)

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })
    return excelBuffer
  } catch (err) {
    console.error('Error generating Excel file:', err.message)
    throw err
  }
}

module.exports = {
  atractivosFields,
  experienciasFields,
  rutasFields,
  getAtractivosData,
  getExperienciasData,
  getRutasData,
  generateExcelFile
}
