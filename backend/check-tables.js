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

async function checkTables() {
  const conn = await pool.getConnection()
  try {
    const [tables] = await conn.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'atractivos_turisticos'`
    )

    console.log('Tablas en la base de datos:\n')
    tables.forEach(t => console.log('  -', t.TABLE_NAME))

    // Mostrar estructura de algunas tablas que podrían contener códigos
    const catalogTables = tables
      .filter(t => t.TABLE_NAME.startsWith('cat_') || t.TABLE_NAME.includes('catolog'))
      .map(t => t.TABLE_NAME)

    console.log('\nTablas de catálogos encontradas:')
    catalogTables.forEach(table => console.log('  -', table))

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

checkTables()
