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

async function checkSchema() {
  const conn = await pool.getConnection()
  try {
    console.log('\n📋 ESQUEMA ACTUAL DE LA BASE DE DATOS\n')
    console.log('='.repeat(80))

    const tables = ['atractivos', 'experiencias', 'rutas']

    for (const table of tables) {
      const [columns] = await conn.query(`DESCRIBE ${table}`)
      console.log(`\n📊 Tabla: ${table} (${columns.length} campos)`)
      console.log('-'.repeat(80))
      columns.forEach((col) => {
        const type = col.Type
        const nullable = col.Null === 'YES' ? 'NULLABLE' : 'NOT NULL'
        const key = col.Key ? `[${col.Key}]` : ''
        console.log(`  ${col.Field.padEnd(35)} ${type.padEnd(25)} ${nullable.padEnd(10)} ${key}`)
      })
    }

    console.log('\n' + '='.repeat(80) + '\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

checkSchema()
