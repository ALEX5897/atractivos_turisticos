const mysql = require('mysql2/promise')
require('dotenv').config()

async function checkAndCreateAuditoria() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '-05:00',
  })

  try {
    const conn = await pool.getConnection()

    // Check if table exists
    const [tables] = await conn.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'auditoria'",
      [process.env.DB_NAME]
    )

    if (tables.length === 0) {
      console.log('❌ Tabla auditoria NO existe')
      console.log('📝 Ejecutando migración...')

      const fs = require('fs')
      const path = require('path')
      const migrationFile = path.join(__dirname, 'database/migration_16_auditoria.sql')
      const sql = fs.readFileSync(migrationFile, 'utf8')
      const statements = sql.split(';').filter(s => s.trim().length > 0)

      for (const statement of statements) {
        try {
          await conn.query(statement.trim())
          console.log('✅ Ejecutado:', statement.trim().substring(0, 50) + '...')
        } catch (err) {
          console.error(`⚠️ Error: ${err.message}`)
        }
      }

      console.log('✅ Migración completada')
    } else {
      console.log('✅ Tabla auditoria existe')

      // Check table structure
      const [columns] = await conn.query(
        "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'auditoria' ORDER BY ORDINAL_POSITION",
        [process.env.DB_NAME]
      )

      console.log('\n📋 Estructura de la tabla auditoria:')
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`)
      })

      // Count rows
      const [[{ count }]] = await conn.query("SELECT COUNT(*) as count FROM auditoria")
      console.log(`\n📊 Registros en auditoria: ${count}`)
    }

    conn.release()
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

checkAndCreateAuditoria()
