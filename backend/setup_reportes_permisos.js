const mysql = require('mysql2/promise')
require('dotenv').config()

async function setupPermisos() {
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

    console.log('📝 Insertando permisos de reportes...')

    // Insertar permisos
    await conn.query(
      "INSERT IGNORE INTO permisos (codigo, nombre, descripcion, modulo, accion) VALUES ('REPORTES_VER', 'Ver Reportes', 'Descargar reportes de módulos', 'reportes', 'ver')"
    )

    // Asignar a admin (id_rol = 3)
    await conn.query(
      "INSERT IGNORE INTO rol_permisos (id_rol, id_permiso) SELECT 3, id FROM permisos WHERE codigo = 'REPORTES_VER'"
    )

    // Asignar a super_admin (id_rol = 4)
    await conn.query(
      "INSERT IGNORE INTO rol_permisos (id_rol, id_permiso) SELECT 4, id FROM permisos WHERE codigo = 'REPORTES_VER'"
    )

    console.log('✅ Permisos configurados correctamente')

    // Verificar
    const [[{ count }]] = await conn.query(
      "SELECT COUNT(*) as count FROM rol_permisos WHERE id_permiso = (SELECT id FROM permisos WHERE codigo = 'REPORTES_VER')"
    )
    console.log(`✅ Roles asignados: ${count}`)

    conn.release()
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

setupPermisos()
