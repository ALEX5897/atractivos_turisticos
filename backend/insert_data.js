require('dotenv').config({ path: './.env' })
const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

async function insertData() {
  let conn
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    })

    const sqlFile = path.join(__dirname, '../database/insert_sample_data.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')

    console.log('Ejecutando script SQL...')
    await conn.query(sql)
    console.log('✓ Datos insertados exitosamente')

    // Mostrar conteos
    const [[{ atractivos }]] = await conn.query('SELECT COUNT(*) AS atractivos FROM atractivos WHERE estado != "ELIMINADO"')
    const [[{ experiencias }]] = await conn.query('SELECT COUNT(*) AS experiencias FROM experiencias WHERE estado != "ELIMINADO"')
    const [[{ rutas }]] = await conn.query('SELECT COUNT(*) AS rutas FROM rutas WHERE estado != "ELIMINADO"')

    console.log(`\n📊 Datos cargados:`)
    console.log(`  - Atractivos: ${atractivos}`)
    console.log(`  - Experiencias: ${experiencias}`)
    console.log(`  - Rutas: ${rutas}`)

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    if (conn) await conn.end()
  }
}

insertData()
