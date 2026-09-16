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
    for (const table of ['experiencias', 'rutas']) {
      const [rows] = await conn.query(`DESCRIBE ${table}`)
      console.log(`\n📋 Estructura tabla ${table.toUpperCase()}:\n`)
      rows.forEach((row) => {
        console.log(
          `${row.Field.padEnd(35)} ${row.Type.padEnd(30)} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'}`
        )
      })
    }
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await conn.end()
    await pool.end()
  }
}

check()
