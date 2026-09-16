const { pool } = require('./src/config/database')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración 13...')
    const migrationPath = path.join(__dirname, '../database/migration_13_add_iniciales_nombre.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement)
      }
    }

    console.log('✅ Migración 13 completada exitosamente')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error en migración:', err)
    process.exit(1)
  }
}

runMigration()
