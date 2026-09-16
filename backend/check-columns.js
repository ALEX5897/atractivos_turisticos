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

async function checkColumns() {
  const conn = await pool.getConnection()
  try {
    const tables = ['nodo', 'centralidad', 'tipo', 'subtipo', 'parroquia', 'categoria', 'modalidad']

    for (const table of tables) {
      const [columns] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'atractivos_turisticos' AND TABLE_NAME = '${table}'`
      )

      console.log(`\nTabla: ${table}`)
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}`)
      })

      // Show sample data
      const [samples] = await conn.query(`SELECT * FROM ${table} LIMIT 3`)
      if (samples.length > 0) {
        console.log(`  Sample data:`)
        samples.forEach(sample => {
          console.log(`    ${JSON.stringify(sample)}`)
        })
      }
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

checkColumns()
