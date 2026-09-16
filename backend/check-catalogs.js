const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'atractivos_turisticos',
  user: 'root',
  password: 'QT426*',
  waitForConnections: true,
})

async function checkCatalogTables() {
  const conn = await pool.getConnection()

  const catalogTables = [
    'cat_categorias',
    'cat_tipos',
    'cat_parroquias',
    'cat_administraciones_zonales',
    'cat_tipos_propietario',
    'cat_tipos_experiencia',
    'cat_tipos_ruta',
  ]

  for (const table of catalogTables) {
    try {
      const [columns] = await conn.query(`DESCRIBE ${table}`)
      console.log(`\n${table}:`)
      columns.forEach((col) => {
        console.log(`  ${col.Field} (${col.Type}) ${col.Key}`)
      })
    } catch (err) {
      console.error(`Error en ${table}: ${err.message}`)
    }
  }

  await conn.end()
  await pool.end()
}

checkCatalogTables()
