const fs = require('fs')
const path = require('path')
const { pool } = require('./src/config/database')

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '../database/migration_09_restructure_experiencias.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🔄 Ejecutando migración 09: Reestructurar tabla experiencias...')

    // Ejecutar la migración
    await pool.query(sql)

    console.log('✅ Migración 09 completada exitosamente')

    // Verificar que los campos se crearon correctamente
    const [columns] = await pool.query(`DESCRIBE experiencias`)
    const columnNames = columns.map(col => col.Field)

    const requiredFields = [
      'n', 'codigo_experiencia_qt', 'parroquia', 'nodo', 'centralidad',
      'modalidad', 'nombre_de_la_experiencia', 'breve_descripcion_y_actividades_a_realizar',
      'direccion', 'tiempo_de_duracion', 'horario_de_atencion', 'costo',
      'capacidad', 'restricciones', 'contactos', 'estado_experiencia'
    ]

    const missingFields = requiredFields.filter(field => !columnNames.includes(field))

    if (missingFields.length === 0) {
      console.log('✅ Todos los campos requeridos se crearon correctamente')
      console.log('\nCampos creados:')
      requiredFields.forEach(field => console.log(`  ✓ ${field}`))
    } else {
      console.log('⚠️ Campos faltantes:', missingFields)
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Error ejecutando migración 09:', err.message)
    process.exit(1)
  }
}

runMigration()
