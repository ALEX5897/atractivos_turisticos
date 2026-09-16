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
    console.log('=== Último número n registrado ===\n')

    const [[{ count }]] = await conn.query('SELECT COUNT(*) as count FROM atractivos')
    console.log(`Total de registros: ${count}\n`)

    const [rows] = await conn.query('SELECT id_atractivo, n, nombre FROM atractivos ORDER BY CAST(n AS SIGNED) DESC LIMIT 5')

    console.log('Últimos 5 registros:')
    rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ID: ${row.id_atractivo}, N: ${row.n}, Nombre: ${row.nombre}`)
    })

    if (rows.length > 0) {
      const lastN = parseInt(rows[0].n)
      const nextN = lastN + 1
      console.log(`\n✓ Último n: ${rows[0].n}`)
      console.log(`✓ Próximo n: ${String(nextN).padStart(3, '0')}`)
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
