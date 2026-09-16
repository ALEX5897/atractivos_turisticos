require('dotenv').config({ path: './.env' })
const mysql = require('mysql2/promise')

async function checkCoordinates() {
  let conn
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    console.log('📍 Revisando coordenadas en base de datos...\n')

    // Atractivos
    const [atrs] = await conn.query('SELECT id_atractivo, nombre, latitud, longitud FROM atractivos WHERE latitud IS NOT NULL AND longitud IS NOT NULL LIMIT 5')
    console.log('✅ Atractivos con coordenadas:', atrs.length > 0 ? atrs.length : 'NINGUNO')
    if (atrs.length > 0) {
      console.log('  Ejemplo:', atrs[0].nombre, `(${atrs[0].latitud}, ${atrs[0].longitud})`)
    }

    // Experiencias
    const [exps] = await conn.query('SELECT id_experiencia, nombre, latitud, longitud FROM experiencias WHERE latitud IS NOT NULL AND longitud IS NOT NULL LIMIT 5')
    console.log('✅ Experiencias con coordenadas:', exps.length > 0 ? exps.length : 'NINGUNO')
    if (exps.length > 0) {
      console.log('  Ejemplo:', exps[0].nombre, `(${exps[0].latitud}, ${exps[0].longitud})`)
    }

    // Rutas
    const [ruts] = await conn.query('SELECT id_ruta, nombre, link_de_ruta FROM rutas LIMIT 5')
    console.log('✅ Rutas con maps:', ruts.length > 0 ? ruts.length : 'NINGUNO')
    if (ruts.length > 0) {
      console.log('  Ejemplo:', ruts[0].nombre, `- Link: ${ruts[0].link_de_ruta ? 'SÍ' : 'NO'}`)
    }

    console.log('\n📌 IMPORTANTE:')
    console.log('- Si no hay coordenadas, necesitas agregarlas manualmente en la base de datos')
    console.log('- Las coordenadas deben estar en formato decimal (ej: -0.2298, -78.5099)')
    console.log('- Para Quito: latitud ~ -0.22, longitud ~ -78.51')

  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    if (conn) await conn.end()
  }
}

checkCoordinates()
