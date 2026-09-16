const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'atractivos_turisticos',
  user: 'root',
  password: 'QT426*',
})

async function runMigration() {
  const conn = await pool.getConnection()
  try {
    console.log('Iniciando migración para agregar campos faltantes...\n')

    const migrationPath = path.join(__dirname, '..', 'database', 'migration_06_add_missing_fields.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')

    const queries = sqlContent.split(';').filter(q => q.trim())

    for (const query of queries) {
      const trimmedQuery = query.trim()
      if (trimmedQuery) {
        console.log(`Ejecutando: ${trimmedQuery.substring(0, 80)}...`)
        await conn.query(trimmedQuery)
        console.log('✓ Ejecutado\n')
      }
    }

    console.log('Verificando estructura de tabla atractivos...\n')
    const [columns] = await conn.query('DESCRIBE atractivos')
    console.log(`✓ Tabla actualizada con ${columns.length} columnas\n`)

    const newColumns = [
      'nombre_alternativo', 'barrio', 'referencia', 'descripcion', 'historia',
      'importancia', 'telefono_alt', 'precio_entrada', 'precio_detalle',
      'accesibilidad_notas', 'fecha_levantamiento', 'observaciones', 'creado_por'
    ]

    newColumns.forEach(col => {
      const colInfo = columns.find(c => c.Field === col)
      if (colInfo) {
        console.log(`  ✓ ${col}`)
      }
    })

    console.log('\n✓ Migración completada exitosamente')
    process.exit(0)
  } catch (err) {
    console.error('✗ Error durante la migración:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

runMigration()
