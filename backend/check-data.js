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
    console.log('=== Registros en tabla atractivos ===\n')
    const [rows] = await conn.query('SELECT * FROM atractivos LIMIT 5')

    if (rows.length === 0) {
      console.log('No hay registros en la tabla atractivos')
    } else {
      console.log(`Total de columnas: ${Object.keys(rows[0]).length}`)
      console.log(`Total de registros: ${rows.length}\n`)

      // Mostrar primer registro
      const firstRow = rows[0]
      console.log('Primer registro:')
      Object.entries(firstRow).forEach(([key, value]) => {
        console.log(`  ${key}: ${value === null ? 'NULL' : value}`)
      })
    }

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
