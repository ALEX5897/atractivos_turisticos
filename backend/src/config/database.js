const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

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
  timezone: '-05:00', // UTC-5 Ecuador
})

async function testConnection() {
  const conn = await pool.getConnection()
  console.log('MySQL conectado correctamente')
  conn.release()
}

async function getConnection() {
  return await pool.getConnection()
}

async function runMigrations() {
  try {
    const conn = await pool.getConnection()
    const migrationFile = path.join(__dirname, '../../../database/migration_16_auditoria.sql')
    const sql = fs.readFileSync(migrationFile, 'utf8')
    const statements = sql.split(';').filter(s => s.trim().length > 0)

    for (const statement of statements) {
      try {
        await conn.query(statement.trim())
      } catch (err) {
        console.error(`⚠️ Migracion error: ${err.message}`)
      }
    }

    conn.release()
    console.log('✅ Migraciones ejecutadas correctamente')
  } catch (err) {
    console.error('⚠️ Error ejecutando migraciones:', err.message)
  }
}

module.exports = { pool, testConnection, getConnection, runMigrations }
