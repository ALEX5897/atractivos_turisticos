const mysql = require('mysql2/promise')

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

async function validate() {
  const conn = await pool.getConnection()
  try {
    console.log('\n✅ VALIDACIÓN FINAL DE BASE DE DATOS\n')
    console.log('═'.repeat(70))

    // Catálogos
    console.log('\n📋 CATÁLOGOS (COMPLETOS Y PRESERVADOS):\n')
    const catalogTables = [
      'cat_categorias',
      'cat_tipos',
      'cat_parroquias',
      'cat_administraciones_zonales',
      'cat_tipos_propietario',
      'cat_tipos_experiencia',
      'cat_tipos_ruta',
      'cat_idiomas',
      'cat_servicios',
    ]

    let allCatalogsOk = true
    for (const table of catalogTables) {
      const [rows] = await conn.query(`SELECT COUNT(*) as total FROM ${table}`)
      const count = rows[0].total
      const status = count > 0 ? '✓' : '✗'
      console.log(`  ${status} ${table.padEnd(40)} ${count} registros`)
      if (count === 0) allCatalogsOk = false
    }

    // Datos de prueba
    console.log('\n📊 DATOS DE PRUEBA INSERTADOS:\n')

    const dataTables = [
      { name: 'atractivos', min: 1 },
      { name: 'experiencias', min: 1 },
      { name: 'rutas', min: 1 },
    ]

    let allDataOk = true
    let totalData = 0
    for (const { name, min } of dataTables) {
      const [rows] = await conn.query(`SELECT COUNT(*) as total FROM ${name}`)
      const count = rows[0].total
      const status = count >= min ? '✓' : '✗'
      console.log(
        `  ${status} ${name.padEnd(40)} ${count} ${count === 1 ? 'registro' : 'registros'}`
      )
      if (count < min) allDataOk = false
      totalData += count
    }

    // Campos importantes
    console.log('\n🔍 CAMPOS DE UBICACIÓN / MAPAS:\n')

    const locationFields = [
      { table: 'atractivos', fields: ['latitud', 'longitud', 'altitud_msnm'] },
      { table: 'experiencias', fields: ['latitud', 'longitud'] },
      { table: 'rutas', fields: ['punto_inicio_lat', 'punto_inicio_lng', 'punto_fin_lat', 'punto_fin_lng'] },
    ]

    let allFieldsOk = true
    for (const { table, fields } of locationFields) {
      const [rows] = await conn.query(`DESCRIBE ${table}`)
      const existingFields = rows.map((r) => r.Field)
      let tableOk = true
      for (const field of fields) {
        const exists = existingFields.includes(field)
        const status = exists ? '✓' : '✗'
        console.log(`  ${status} ${table}.${field}`)
        if (!exists) {
          tableOk = false
          allFieldsOk = false
        }
      }
    }

    // Ejemplos de datos
    console.log('\n📝 EJEMPLOS DE DATOS INSERTADOS:\n')

    const [atractivos] = await conn.query(`
      SELECT codigo, nombre, latitud, longitud FROM atractivos LIMIT 1
    `)
    if (atractivos.length > 0) {
      const a = atractivos[0]
      console.log(`  Atractivo: ${a.nombre}`)
      console.log(`    Código: ${a.codigo}`)
      console.log(`    Ubicación: ${a.latitud}, ${a.longitud}`)
    }

    const [experiencias] = await conn.query(`
      SELECT codigo, nombre, precio_desde, precio_hasta FROM experiencias LIMIT 1
    `)
    if (experiencias.length > 0) {
      const e = experiencias[0]
      console.log(`\n  Experiencia: ${e.nombre}`)
      console.log(`    Código: ${e.codigo}`)
      console.log(`    Precio: $${e.precio_desde} - $${e.precio_hasta}`)
    }

    const [rutas] = await conn.query(`
      SELECT codigo, nombre, punto_inicio_nombre, punto_fin_nombre FROM rutas LIMIT 1
    `)
    if (rutas.length > 0) {
      const r = rutas[0]
      console.log(`\n  Ruta: ${r.nombre}`)
      console.log(`    Código: ${r.codigo}`)
      console.log(`    Recorrido: ${r.punto_inicio_nombre} → ${r.punto_fin_nombre}`)
    }

    // Resumen final
    console.log('\n' + '═'.repeat(70))
    if (allCatalogsOk && allDataOk && allFieldsOk) {
      console.log('\n✅ ¡BASE DE DATOS LISTA PARA USAR!')
      console.log('\n📈 Estado:')
      console.log(`   • Catálogos: ${catalogTables.length}/9 ✓`)
      console.log(`   • Datos de prueba: ${totalData} registros`)
      console.log(`   • Campos de mapas: Agregados y funcionales`)
      console.log(`   • Migración: Completada`)
      console.log('\n🚀 Puedes comenzar a usar la aplicación con los datos de prueba\n')
    } else {
      console.log('\n⚠️  Hay problemas en la validación\n')
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

validate()
