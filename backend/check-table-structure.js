const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'atractivos_turisticos',
  user: 'root',
  password: 'QT426*',
})

async function check() {
  const conn = await pool.getConnection()
  try {
    console.log('=== Estructura de tabla atractivos ===\n')
    const [columns] = await conn.query('DESCRIBE atractivos')
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(40)} ${col.Type.padEnd(30)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`)
    })

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

check()
