const mysql = require('mysql2/promise')
const fs = require('fs')
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

async function cleanDatabase() {
  const conn = await pool.getConnection()
  try {
    console.log('🧹 Iniciando limpieza de datos...\n')
    console.log('⚠️  Se eliminarán todos los datos excepto los catálogos\n')

    // Deshabilitar verificación de claves foráneas
    await conn.query('SET FOREIGN_KEY_CHECKS = 0')
    console.log('✓ Verificación de claves foráneas deshabilitada\n')

    // Tablas a limpiar (en orden de dependencias)
    const tablesToClean = [
      'rutas_experiencias',
      'rutas_atractivos',
      'rutas_fotos',
      'rutas',
      'experiencias_idiomas',
      'experiencias_fotos',
      'experiencias',
      'atractivos_idiomas',
      'atractivos_servicios',
      'atractivos_fotos',
      'atractivos',
      'auditoria',
    ]

    // Limpiar cada tabla
    for (const table of tablesToClean) {
      const [result] = await conn.query(`DELETE FROM ${table}`)
      console.log(`✓ ${table}: ${result.affectedRows} registros eliminados`)
    }

    console.log('\n🔄 Reseteando auto_increment...\n')

    // Resetear auto_increment
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
      await conn.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`)
      console.log(`✓ ${table}: auto_increment reseteado`)
    }

    // Habilitar verificación de claves foráneas nuevamente
    await conn.query('SET FOREIGN_KEY_CHECKS = 1')
    console.log('\n✓ Verificación de claves foráneas habilitada\n')

    console.log('═'.repeat(60))
    console.log('✅ BASE DE DATOS LIMPIADA EXITOSAMENTE')
    console.log('═'.repeat(60))
    console.log('\n📋 Catálogos preservados:')
    console.log('  ✓ cat_categorias')
    console.log('  ✓ cat_tipos')
    console.log('  ✓ cat_parroquias')
    console.log('  ✓ cat_administraciones_zonales')
    console.log('  ✓ cat_tipos_propietario')
    console.log('  ✓ cat_tipos_experiencia')
    console.log('  ✓ cat_tipos_ruta')
    console.log('  ✓ cat_idiomas')
    console.log('  ✓ cat_servicios\n')

    console.log('Ready to insert new data from 0 ✨\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Error durante la limpieza:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

cleanDatabase()
