const XLSX = require('xlsx')
const mysql = require('mysql2/promise')
const path = require('path')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'atractivos_turisticos',
  user: 'root',
  password: 'QT426*',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const docsBase = path.join(__dirname, '../documentos_base')

// Cache para catálogos
let catalogCache = {}

async function loadCatalogCache(conn) {
  console.log('\n📦 Cargando catálogos en caché...')

  const catalogs = {
    cat_categorias: 'id_categoria',
    cat_tipos: 'id_tipo',
    cat_parroquias: 'id_parroquia',
    cat_administraciones_zonales: 'id_adm_zonal',
    cat_tipos_propietario: 'id_tipo_prop',
    cat_tipos_experiencia: 'id_tipo_exp',
    cat_tipos_ruta: 'id_tipo_ruta',
  }

  for (const [table, idCol] of Object.entries(catalogs)) {
    const [rows] = await conn.query(`SELECT ${idCol} as id, nombre FROM ${table}`)
    catalogCache[table] = {}
    rows.forEach((row) => {
      catalogCache[table][row.nombre.toLowerCase()] = row.id
      catalogCache[table][row.nombre] = row.id
    })
  }

  console.log('✓ Catálogos cargados')
}

async function findIdFromCatalog(conn, tableName, searchValue) {
  if (!searchValue || typeof searchValue !== 'string') return null

  // Primero intentar en caché
  if (catalogCache[tableName]) {
    const id = catalogCache[tableName][searchValue.toLowerCase()] || catalogCache[tableName][searchValue]
    if (id) return id
  }

  // Si no está en caché, buscar en BD
  try {
    const [rows] = await conn.query(`SELECT id FROM ${tableName} WHERE nombre = ? OR nombre LIKE ?`, [searchValue, `%${searchValue}%`])
    if (rows.length > 0) {
      return rows[0].id
    }
  } catch (err) {
    // Ignorar errores de búsqueda
  }

  return null
}

async function loadAtractivos(conn) {
  console.log('\n🏔️  Cargando ATRACTIVOS...\n')

  const filepath = path.join(docsBase, 'ATRACTIVOS TURÍSTICOS CODIFICACIÓN ABRIL 2026.xlsx')
  const workbook = XLSX.readFile(filepath)
  const sheet = workbook.Sheets['ATRACTIVOS']
  const data = XLSX.utils.sheet_to_json(sheet)

  let inserted = 0
  let skipped = 0

  for (const row of data) {
    try {
      // Mapeo de campos
      const codigo = row['CÓDIGO QT'] || row['CÓDIGO MINTUR'] || null
      if (!codigo || !row['NOMBRE DEL ATRACTIVO / RECURSO']) {
        skipped++
        continue
      }

      // Buscar IDs de catálogos
      const idCategoria = await findIdFromCatalog(conn, 'cat_categorias', row['CATEGORÍA'])
      const idTipo = await findIdFromCatalog(conn, 'cat_tipos', row['TIPO'])
      const idParroquia = await findIdFromCatalog(conn, 'cat_parroquias', row['PARROQUIA'])
      const idAdmZonal = await findIdFromCatalog(conn, 'cat_administraciones_zonales', row['NODO'] || row['CENTRALIDAD'])

      const jerarquia = row['JERARQUÍA'] ? parseInt(row['JERARQUÍA'].replace(/[^\d]/g, '')) || 1 : 1
      const latitud = row['LATITUD'] ? parseFloat(row['LATITUD']) : null
      const longitud = row['LONGITUD'] ? parseFloat(row['LONGITUD']) : null

      const [result] = await conn.query(
        `INSERT INTO atractivos
         (codigo, nombre, id_categoria, id_tipo, jerarquia, id_parroquia, id_adm_zonal,
          direccion, latitud, longitud, horario, estado,
          n, codigo_mintur, codigo_qt, parroquia, nodo, centralidad, subcentralidad,
          nombre_del_atractivo_recurso, categoria, tipo, sub_tipo, publica,
          breve_descripcion, servicios_incluidos, acceso_de_transporte,
          restriccion_a_la_accesibilidad, pet_friendly, contacto_telefono_correo_electronico,
          dpa_manzana_localidad_del_atractivo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo,
          row['NOMBRE DEL ATRACTIVO / RECURSO'],
          idCategoria || 1,
          idTipo || 1,
          jerarquia,
          idParroquia || null,
          idAdmZonal || null,
          row['DIRECCIÓN'] || null,
          latitud,
          longitud,
          row['HORARIO'] || null,
          row['ESTADO'] || 'ACTIVO',
          row['N.-'] || null,
          row['CÓDIGO MINTUR'] || null,
          row['CÓDIGO QT'] || null,
          row['PARROQUIA'] || null,
          row['NODO'] || null,
          row['CENTRALIDAD'] || null,
          row['SUBCENTRALIDAD'] || null,
          row['NOMBRE DEL ATRACTIVO / RECURSO'] || null,
          row['CATEGORÍA'] || null,
          row['TIPO'] || null,
          row['SUB TIPO'] || null,
          row['PÚBLICA'] || null,
          row['BREVE DESCRIPCIÓN'] || null,
          row['SERVICIOS INCLUIDOS'] || null,
          row['ACCESO DE TRANSPORTE'] || null,
          row['RESTRICCIÓN A LA ACCESIBILIDAD'] || null,
          row['PET FRIENDLY'] || null,
          row['CONTACTO - TELÉFONO- CORREO ELECTRÓNICO'] || null,
          row['DPA MANZANA/LOCALIDAD DEL ATRACTIVO'] || null,
        ]
      )

      inserted++
      if (inserted % 50 === 0) {
        console.log(`  ✓ ${inserted} atractivos insertados...`)
      }
    } catch (err) {
      skipped++
      if (skipped <= 5) {
        console.error(`  ⚠️  Error en fila: ${err.message}`)
      }
    }
  }

  console.log(`\n✅ ATRACTIVOS: ${inserted} insertados, ${skipped} saltados`)
  return inserted
}

async function loadExperiencias(conn) {
  console.log('\n🎯 Cargando EXPERIENCIAS...\n')

  const filepath = path.join(docsBase, 'EXPERIENCIAS TURÍSTICAS CODIFICACIÓN ABRIL 2026.xlsx')
  const workbook = XLSX.readFile(filepath)
  const sheet = workbook.Sheets['EXPERIENCIAS']
  const data = XLSX.utils.sheet_to_json(sheet)

  let inserted = 0
  let skipped = 0

  for (const row of data) {
    try {
      const codigo = row['CÓDIGO EXPERIENCIA QT'] || null
      if (!codigo || !row['NOMBRE DE LA EXPERIENCIA']) {
        skipped++
        continue
      }

      const idTipoExp = await findIdFromCatalog(conn, 'cat_tipos_experiencia', row['MODALIDAD'])
      const latitud = row['LATITUD'] ? parseFloat(row['LATITUD']) : null
      const longitud = row['LONGITUD'] ? parseFloat(row['LONGITUD']) : null

      // Parsear duración
      let duracionHoras = null
      const duracionStr = row['TIEMPO DE DURACIÓN ']
      if (duracionStr) {
        const match = duracionStr.toString().match(/\d+\.?\d*/)
        duracionHoras = match ? parseFloat(match[0]) : null
      }

      const [result] = await conn.query(
        `INSERT INTO experiencias
         (codigo, nombre, id_tipo_exp,
          n, estado_experiencia, codigo_experiencia_qt, parroquia, nodo, centralidad, modalidad,
          nombre_de_la_experiencia, breve_descripcion_y_actividades_a_realizar,
          direccion, latitud, longitud, tiempo_de_duracion, horario_de_atencion,
          costo, capacidad, restricciones, contactos, duracion_horas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo,
          row['NOMBRE DE LA EXPERIENCIA'],
          idTipoExp || 1,
          row['N°'] || null,
          row['ESTADO EXPERIENCIA'] || 'ACTIVO',
          row['CÓDIGO EXPERIENCIA QT'] || null,
          row['PARROQUIA'] || null,
          row['NODO'] || null,
          row['CENTRALIDAD'] || null,
          row['MODALIDAD'] || null,
          row['NOMBRE DE LA EXPERIENCIA'] || null,
          row['BREVE DESCRIPCIÓN Y ACTIVIDADES A REALIZAR'] || null,
          row['DIRECCIÓN'] || null,
          latitud,
          longitud,
          row['TIEMPO DE DURACIÓN '] || null,
          row['HORARIO DE ATENCIÓN'] || null,
          row['COSTO'] || null,
          row['CAPACIDAD'] || null,
          row['RESTRICCIONES'] || null,
          row['CONTACTOS'] || null,
          duracionHoras,
        ]
      )

      inserted++
      if (inserted % 50 === 0) {
        console.log(`  ✓ ${inserted} experiencias insertadas...`)
      }
    } catch (err) {
      skipped++
      if (skipped <= 5) {
        console.error(`  ⚠️  Error en fila: ${err.message}`)
      }
    }
  }

  console.log(`\n✅ EXPERIENCIAS: ${inserted} insertadas, ${skipped} saltadas`)
  return inserted
}

async function loadRutas(conn) {
  console.log('\n🗺️  Cargando RUTAS...\n')

  const filepath = path.join(docsBase, 'RUTAS TURÍSTICAS CODIFICACIÓN ABRIL 2026.xlsx')
  const workbook = XLSX.readFile(filepath)
  const sheet = workbook.Sheets['RUTAS']
  const data = XLSX.utils.sheet_to_json(sheet)

  let inserted = 0
  let skipped = 0

  for (const row of data) {
    try {
      const codigo = row['CÓDIGO QT'] || null
      if (!codigo || !row['NOMBRE DE LA RUTA TURÍSTICA']) {
        skipped++
        continue
      }

      const idTipoRuta = await findIdFromCatalog(conn, 'cat_tipos_ruta', row['CLASIFICACIÓN'])

      // Parsear distancia
      let distanciaKm = null
      const distStr = row['DISTANCIA (Km)']
      if (distStr) {
        const match = distStr.toString().match(/\d+\.?\d*/)
        distanciaKm = match ? parseFloat(match[0]) : null
      }

      // Parsear duración
      let duracionHoras = null
      const durStr = row['TIEMPO DE DURACIÓN DE RUTA (horas)']
      if (durStr) {
        const match = durStr.toString().match(/\d+\.?\d*/)
        duracionHoras = match ? parseFloat(match[0]) : null
      }

      // Parsear altitud
      let altitudMsnm = null
      const altStr = row['ALTITUD (m.s.n.m)']
      if (altStr) {
        const match = altStr.toString().match(/\d+/)
        altitudMsnm = match ? parseInt(match[0]) : null
      }

      // Mapear dificultad correctamente
      let dificultad = null
      if (row['DIFICULTAD']) {
        const dif = row['DIFICULTAD'].toUpperCase().trim()
        const difMap = {
          BAJA: 'FACIL',
          MEDIA: 'MODERADO',
          ALTA: 'DIFICIL',
          'MEDIA -ALTA': 'DIFICIL',
          'MEDIA - ALTA': 'DIFICIL',
        }
        dificultad = difMap[dif] || null
      }

      const [result] = await conn.query(
        `INSERT INTO rutas
         (codigo, nombre, id_tipo_ruta, dificultad, distancia_km, estado,
          n, codigo_qt, nodo, centralidad, nombre_de_la_ruta_turistica,
          clasificacion, breve_descripcion, modalidad,
          tiempo_de_duracion_de_ruta_horas, altitud_m_s_n_m, link_de_ruta,
          duracion_horas, altitud_max)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo,
          row['NOMBRE DE LA RUTA TURÍSTICA'],
          idTipoRuta || 1,
          dificultad,
          distanciaKm,
          row['ESTADO'] || 'ACTIVO',
          row['N°'] || null,
          row['CÓDIGO QT'] || null,
          row['NODO'] || null,
          row['CENTRALIDAD'] || null,
          row['NOMBRE DE LA RUTA TURÍSTICA'] || null,
          row['CLASIFICACIÓN'] || null,
          row['BREVE DESCRIPCIÓN'] || null,
          row['MODALIDAD'] || null,
          row['TIEMPO DE DURACIÓN DE RUTA (horas)'] || null,
          row['ALTITUD (m.s.n.m)'] || null,
          row['LINK DE RUTA '] || null,
          duracionHoras,
          altitudMsnm,
        ]
      )

      inserted++
      if (inserted % 50 === 0) {
        console.log(`  ✓ ${inserted} rutas insertadas...`)
      }
    } catch (err) {
      skipped++
      if (skipped <= 5) {
        console.error(`  ⚠️  Error en fila: ${err.message}`)
      }
    }
  }

  console.log(`\n✅ RUTAS: ${inserted} insertadas, ${skipped} saltadas`)
  return inserted
}

async function main() {
  const conn = await pool.getConnection()
  try {
    console.log('\n📥 CARGANDO DATOS REALES DESDE EXCEL\n')
    console.log('='.repeat(80))

    await loadCatalogCache(conn)

    const atractCount = await loadAtractivos(conn)
    const expCount = await loadExperiencias(conn)
    const rutasCount = await loadRutas(conn)

    console.log('\n' + '='.repeat(80))
    console.log('\n✅ CARGA COMPLETADA\n')
    console.log(`📊 Resumen:`)
    console.log(`  • Atractivos: ${atractCount}`)
    console.log(`  • Experiencias: ${expCount}`)
    console.log(`  • Rutas: ${rutasCount}`)
    console.log(`  ────────────────────`)
    console.log(`  Total: ${atractCount + expCount + rutasCount}\n`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

main()
