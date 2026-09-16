const mysql = require('mysql2/promise')
require('dotenv').config()

async function testAuditoria() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '-05:00',
  })

  try {
    const conn = await pool.getConnection()

    // Insertar registro de prueba
    console.log('📝 Insertando registro de prueba en auditoria...')
    await conn.query(`
      INSERT INTO auditoria (
        tabla_afectada, registro_id, tipo_accion, usuario_id, usuario_nombre,
        descripcion, datos_anteriores, datos_nuevos, cambios_campo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'roles',
      1,
      'CREATE',
      1,
      'admin',
      'Se creó nuevo registro',
      null,
      JSON.stringify({ nombre: 'Admin', descripcion: 'Administrador del sistema' }),
      null
    ])
    console.log('✅ Registro insertado')

    // Contar registros
    const [[{ count }]] = await conn.query("SELECT COUNT(*) as count FROM auditoria")
    console.log(`📊 Total de registros en auditoria: ${count}`)

    // Listar los últimos 5
    const [rows] = await conn.query("SELECT * FROM auditoria ORDER BY id DESC LIMIT 5")
    console.log('\n📋 Últimos registros:')
    rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Tabla: ${row.tabla_afectada}, Acción: ${row.tipo_accion}, Usuario: ${row.usuario_nombre}`)
    })

    conn.release()
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

testAuditoria()
