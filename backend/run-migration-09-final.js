require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

async function runMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'atractivos_turisticos',
    timezone: '-05:00',
    multipleStatements: false
  })

  try {
    const migrationPath = path.join(__dirname, '../database/migration_09_restructure_experiencias_v2.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')

    // Dividir por ; y ejecutar cada statement por separado
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    console.log('🔄 Ejecutando migración 09 v2: Reestructurar tabla experiencias...')
    console.log(`📊 Total de statements: ${statements.length}`)

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      try {
        await conn.query(stmt)
        if (!stmt.toLowerCase().startsWith('select')) {
          console.log(`✓ [${i+1}/${statements.length}] ${stmt.substring(0, 60)}...`)
        }
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEY_NAME') {
          console.log(`⚠️ [${i+1}/${statements.length}] Campo/índice ya existe: ${err.message.substring(0, 50)}`)
        } else {
          throw err
        }
      }
    }

    console.log('\n✅ Migración 09 v2 completada exitosamente')

    // Verificar que los campos se crearon correctamente
    const [columns] = await conn.query(`DESCRIBE experiencias`)
    const columnNames = columns.map(col => col.Field)

    const requiredFields = [
      'n', 'codigo_experiencia_qt', 'parroquia', 'nodo', 'centralidad',
      'modalidad', 'nombre_de_la_experiencia', 'breve_descripcion_y_actividades_a_realizar',
      'direccion', 'tiempo_de_duracion', 'horario_de_atencion', 'costo',
      'capacidad', 'restricciones', 'contactos', 'estado_experiencia'
    ]

    const missingFields = requiredFields.filter(field => !columnNames.includes(field))
    const existingFields = requiredFields.filter(field => columnNames.includes(field))

    console.log(`\n📋 Total de campos en tabla: ${columnNames.length}`)
    console.log(`✅ Campos requeridos presentes: ${existingFields.length}/${requiredFields.length}`)

    if (missingFields.length === 0) {
      console.log('\n✅ ¡Todos los campos requeridos están presentes!')
      console.log('\nCampos listos para usar:')
      requiredFields.forEach(field => console.log(`  ✓ ${field}`))
    } else {
      console.log(`\n⚠️ Campos faltantes (${missingFields.length}):`)
      missingFields.forEach(field => console.log(`  ✗ ${field}`))
    }

    await conn.end()
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error ejecutando migración 09 v2:', err.message)
    if (err.sql) {
      console.error('SQL:', err.sql.substring(0, 100))
    }
    await conn.end()
    process.exit(1)
  }
}

runMigration()
