const mysql = require('mysql2/promise')

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

async function check() {
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.query(`DESCRIBE rutas`)
    const puntoCols = rows.filter((r) => r.Field.includes('punto'))
    console.log('Campos de PUNTO en tabla rutas:')
    if (puntoCols.length === 0) {
      console.log('  ❌ No hay campos de punto')
    } else {
      puntoCols.forEach((r) => console.log(`  ✓ ${r.Field}`))
    }
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await conn.end()
    await pool.end()
  }
}

check()
