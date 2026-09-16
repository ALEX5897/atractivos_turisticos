const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

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

async function runMigration() {
  const conn = await pool.getConnection()
  try {
    console.log('Iniciando migración de subcentralidades...\n')

    // Leer el archivo de migración SQL
    const migrationPath = path.join(__dirname, '..', 'database', 'migration_03_add_subcentralidades.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')

    // Dividir por separador de consulta (;)
    const queries = sqlContent.split(';').filter(q => q.trim())

    for (const query of queries) {
      const trimmedQuery = query.trim()
      if (trimmedQuery) {
        console.log(`Ejecutando: ${trimmedQuery.substring(0, 60)}...`)
        await conn.query(trimmedQuery)
        console.log('✓ Ejecutado\n')
      }
    }

    console.log('Verificando tabla cat_subcentralidades...\n')
    const [rows] = await conn.query('SELECT COUNT(*) as total FROM cat_subcentralidades')
    console.log(`✓ Tabla creada con ${rows[0].total} registros`)

    console.log('\n✓ Migración completada exitosamente')
    process.exit(0)
  } catch (err) {
    console.error('✗ Error durante la migración:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

runMigration()
