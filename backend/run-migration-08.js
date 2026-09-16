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
    console.log('Iniciando migración para agregar campos de códigos individuales...\n')

    const migrationPath = path.join(__dirname, '..', 'database', 'migration_08_add_code_fields.sql')
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
    const codeFields = ['cod_dpa', 'cod_categoria', 'cod_nodo', 'cod_centralidad', 'cod_subcentralidad', 'cod_tipo', 'cod_subtipo']

    console.log('Campos de código verificados:')
    codeFields.forEach(field => {
      const col = columns.find(c => c.Field === field)
      if (col) {
        console.log(`  ✓ ${field} - ${col.Type}`)
      } else {
        console.log(`  ✗ ${field} - NO ENCONTRADO`)
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
