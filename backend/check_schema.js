require('dotenv').config({ path: './.env' })
const mysql = require('mysql2/promise')

async function checkSchema() {
  let conn
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    console.log('📋 Columnas de tabla ATRACTIVOS:')
    const [atractivos] = await conn.query('DESCRIBE atractivos')
    atractivos.forEach(col => console.log(`  - ${col.Field} (${col.Type})`))

    console.log('\n📋 Columnas de tabla EXPERIENCIAS:')
    const [experiencias] = await conn.query('DESCRIBE experiencias')
    experiencias.forEach(col => console.log(`  - ${col.Field} (${col.Type})`))

    console.log('\n📋 Columnas de tabla RUTAS:')
    const [rutas] = await conn.query('DESCRIBE rutas')
    rutas.forEach(col => console.log(`  - ${col.Field} (${col.Type})`))

    console.log('\n📊 Conteos actuales:')
    const [[{ atr }]] = await conn.query('SELECT COUNT(*) AS atractivos FROM atractivos')
    const [[{ exp }]] = await conn.query('SELECT COUNT(*) AS experiencias FROM experiencias')
    const [[{ rut }]] = await conn.query('SELECT COUNT(*) AS rutas FROM rutas')
    console.log(`  - Atractivos: ${atractivos}`)
    console.log(`  - Experiencias: ${exp}`)
    console.log(`  - Rutas: ${rut}`)

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    if (conn) await conn.end()
  }
}

checkSchema()
