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
    console.log('\n📦 Ejecutando migración: Agregar campos de Puntos...\n')

    // Agregar campos a rutas
    console.log('📋 Agregando campos a tabla RUTAS...')
    const rutasFields = [
      'ALTER TABLE rutas ADD COLUMN punto_inicio_nombre VARCHAR(200) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN punto_inicio_lat DECIMAL(10,7) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN punto_inicio_lng DECIMAL(10,7) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN punto_fin_nombre VARCHAR(200) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN punto_fin_lat DECIMAL(10,7) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN punto_fin_lng DECIMAL(10,7) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN descripcion TEXT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN historia TEXT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN duracion_horas DECIMAL(5,2) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN desnivel_positivo SMALLINT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN desnivel_negativo SMALLINT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN altitud_min SMALLINT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN altitud_max SMALLINT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN url_mapa VARCHAR(500) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN url_gpx VARCHAR(500) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN url_kml VARCHAR(500) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN mejor_epoca VARCHAR(255) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN recomendaciones TEXT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN equipo_sugerido TEXT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN incluye TEXT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN no_incluye TEXT DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN precio_desde DECIMAL(10,2) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN precio_hasta DECIMAL(10,2) DEFAULT NULL',
      'ALTER TABLE rutas ADD COLUMN accesible TINYINT(1) NOT NULL DEFAULT 0',
    ]

    for (const sql of rutasFields) {
      try {
        await conn.query(sql)
        console.log(`  ✓ ${sql.split('ADD COLUMN')[1].trim().substring(0, 40)}`)
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log(`  ⚠️  Campo ya existe`)
        } else {
          console.error(`  ✗ Error: ${err.message}`)
        }
      }
    }

    console.log('\n📋 Agregando campos a tabla EXPERIENCIAS...')
    const experienciasFields = [
      'ALTER TABLE experiencias ADD COLUMN latitud DECIMAL(10,7) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN longitud DECIMAL(10,7) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN duracion_horas DECIMAL(5,2) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN precio_desde DECIMAL(10,2) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN precio_hasta DECIMAL(10,2) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN incluye TEXT DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN no_incluye TEXT DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN operador_nombre VARCHAR(200) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN operador_ruc VARCHAR(13) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN operador_telefono VARCHAR(20) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN operador_email VARCHAR(120) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN operador_web VARCHAR(255) DEFAULT NULL',
      'ALTER TABLE experiencias ADD COLUMN accesible TINYINT(1) NOT NULL DEFAULT 0',
    ]

    for (const sql of experienciasFields) {
      try {
        await conn.query(sql)
        console.log(`  ✓ ${sql.split('ADD COLUMN')[1].trim().substring(0, 40)}`)
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log(`  ⚠️  Campo ya existe`)
        } else {
          console.error(`  ✗ Error: ${err.message}`)
        }
      }
    }

    console.log('\n📋 Agregando campos a tabla ATRACTIVOS...')
    const atractivosFields = [
      'ALTER TABLE atractivos ADD COLUMN altitud_msnm SMALLINT DEFAULT NULL',
      'ALTER TABLE atractivos ADD COLUMN historia TEXT DEFAULT NULL',
      'ALTER TABLE atractivos ADD COLUMN telefono VARCHAR(20) DEFAULT NULL',
      'ALTER TABLE atractivos ADD COLUMN email VARCHAR(120) DEFAULT NULL',
      'ALTER TABLE atractivos ADD COLUMN sitio_web VARCHAR(255) DEFAULT NULL',
      'ALTER TABLE atractivos ADD COLUMN accesible_movilidad TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE atractivos ADD COLUMN accesible_visual TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE atractivos ADD COLUMN accesible_auditiva TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE atractivos ADD COLUMN accesible_cognitiva TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE atractivos ADD COLUMN senaletica TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE atractivos ADD COLUMN baterias_sanitarias TINYINT(1) NOT NULL DEFAULT 0',
      'ALTER TABLE atractivos ADD COLUMN estacionamiento TINYINT(1) NOT NULL DEFAULT 0',
    ]

    for (const sql of atractivosFields) {
      try {
        await conn.query(sql)
        console.log(`  ✓ ${sql.split('ADD COLUMN')[1].trim().substring(0, 40)}`)
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log(`  ⚠️  Campo ya existe`)
        } else {
          console.error(`  ✗ Error: ${err.message}`)
        }
      }
    }

    console.log('\n' + '═'.repeat(60))
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

runMigration()
