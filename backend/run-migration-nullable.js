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
    console.log('Iniciando migración para permitir NULL en campos opcionales...\n')

    const migrationPath = path.join(__dirname, '..', 'database', 'migration_05_make_fields_nullable.sql')
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

    console.log('Verificando cambios...\n')
    const [columns] = await conn.query('DESCRIBE atractivos')
    const idCatCol = columns.find(c => c.Field === 'id_categoria')
    const idTipCol = columns.find(c => c.Field === 'id_tipo')

    console.log(`  id_categoria: ${idCatCol.Null} (permite NULL: ${idCatCol.Null === 'YES'})`)
    console.log(`  id_tipo: ${idTipCol.Null} (permite NULL: ${idTipCol.Null === 'YES'})`)

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
