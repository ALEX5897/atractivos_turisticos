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

async function validateDatabase() {
  const conn = await pool.getConnection()
  try {
    console.log('\n📊 VALIDACIÓN DE BASE DE DATOS\n')
    console.log('═'.repeat(60))

    // Verificar catálogos
    console.log('\n📋 CATÁLOGOS (deben estar completos):\n')

    const catalogs = [
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

    for (const catalog of catalogs) {
      const [rows] = await conn.query(`SELECT COUNT(*) as total FROM ${catalog}`)
      const count = rows[0].total
      const status = count > 0 ? '✓' : '✗'
      console.log(`${status} ${catalog.padEnd(35)} ${count} registros`)
    }

    // Verificar tablas principales
    console.log('\n\n🗂️  TABLAS PRINCIPALES (deben estar vacías):\n')

    const dataTables = [
      'atractivos',
      'atractivos_fotos',
      'atractivos_servicios',
      'atractivos_idiomas',
      'experiencias',
      'experiencias_fotos',
      'experiencias_idiomas',
      'rutas',
      'rutas_fotos',
      'rutas_atractivos',
      'rutas_experiencias',
      'auditoria',
    ]

    let allEmpty = true
    for (const table of dataTables) {
      const [rows] = await conn.query(`SELECT COUNT(*) as total FROM ${table}`)
      const count = rows[0].total
      const status = count === 0 ? '✓' : '✗'
      console.log(`${status} ${table.padEnd(35)} ${count} registros`)
      if (count > 0) allEmpty = false
    }

    // Verificar auto_increment
    console.log('\n\n🔄 AUTO_INCREMENT (deben estar en 1):\n')

    const autoIncrementTables = [
      'atractivos',
      'atractivos_fotos',
      'experiencias',
      'experiencias_fotos',
      'rutas',
      'rutas_fotos',
      'auditoria',
    ]

    for (const table of autoIncrementTables) {
      const [rows] = await conn.query(
        `SELECT AUTO_INCREMENT FROM information_schema.tables
         WHERE table_name = '${table}' AND table_schema = 'atractivos_turisticos'`
      )
      const nextId = rows[0]?.AUTO_INCREMENT || 1
      const status = nextId === 1 ? '✓' : '⚠'
      console.log(`${status} ${table.padEnd(35)} Próximo ID: ${nextId}`)
    }

    // Resumen
    console.log('\n' + '═'.repeat(60))
    if (allEmpty) {
      console.log('✅ VALIDACIÓN EXITOSA - Base de datos lista para datos nuevos\n')
    } else {
      console.log('❌ VALIDACIÓN FALLIDA - Aún hay datos en tablas principales\n')
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Error durante la validación:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

validateDatabase()
