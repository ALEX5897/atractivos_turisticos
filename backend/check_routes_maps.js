require('dotenv').config({ path: './.env' })
const mysql = require('mysql2/promise')

async function checkRouteMaps() {
  let conn
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    console.log('🗺️  Revisando mapas de rutas...\n')

    const [rutas] = await conn.query(
      `SELECT id_ruta, nombre, link_de_ruta FROM rutas LIMIT 10`
    )

    rutas.forEach((r, i) => {
      console.log(`${i + 1}. ${r.nombre}`)
      console.log(`   Link: ${r.link_de_ruta ? r.link_de_ruta.substring(0, 80) + '...' : 'NULL/VACÍO'}`)
      console.log('')
    })

    const withMaps = rutas.filter(r => r.link_de_ruta)
    const withoutMaps = rutas.filter(r => !r.link_de_ruta)

    console.log(`\n📊 Resumen:`)
    console.log(`  ✅ Con mapa: ${withMaps.length}`)
    console.log(`  ❌ Sin mapa: ${withoutMaps.length}`)

    if (withoutMaps.length > 0) {
      console.log('\n⚠️  Rutas sin mapas necesitan URLs. Ejemplo de URL válida:')
      console.log('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...')
    }

  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    if (conn) await conn.end()
  }
}

checkRouteMaps()
