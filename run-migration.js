const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'atractivos_db',
    multipleStatements: true,
  })

  try {
    const migrationFile = path.join(__dirname, 'database', 'migration_16_auditoria.sql')
    const sql = fs.readFileSync(migrationFile, 'utf8')

    console.log('Ejecutando migración...')
    await connection.query(sql)
    console.log('✅ Migración completada exitosamente')
  } catch (err) {
    console.error('❌ Error ejecutando migración:', err.message)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

runMigration()
