const mysql = require('mysql2/promise')
require('dotenv').config()

async function recreateAuditoria() {
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

    console.log('🔄 Eliminando tabla auditoria existente...')
    await conn.query('DROP TABLE IF EXISTS auditoria')
    console.log('✅ Tabla eliminada')

    console.log('📝 Creando tabla auditoria con estructura correcta...')
    const createTableSQL = `
      CREATE TABLE auditoria (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tabla_afectada VARCHAR(50) NOT NULL,
        registro_id INT NOT NULL,
        tipo_accion ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
        usuario_id INT,
        usuario_nombre VARCHAR(255),
        fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        descripcion TEXT,
        datos_anteriores JSON,
        datos_nuevos JSON,
        cambios_campo JSON,
        ip_direccion VARCHAR(45),
        INDEX idx_tabla_registro (tabla_afectada, registro_id),
        INDEX idx_usuario (usuario_id),
        INDEX idx_fecha (fecha_hora),
        INDEX idx_tipo_accion (tipo_accion)
      )
    `
    await conn.query(createTableSQL)
    console.log('✅ Tabla creada')

    console.log('📝 Insertando permisos y asignaciones de roles...')
    await conn.query(
      "INSERT IGNORE INTO permisos (codigo, nombre, descripcion, modulo, accion) VALUES ('AUDITORIA_VER', 'Ver Auditoría', 'Ver historial de cambios y auditoría', 'auditoria', 'ver')"
    )
    await conn.query(
      "INSERT IGNORE INTO rol_permisos (id_rol, id_permiso) SELECT 3, id FROM permisos WHERE codigo = 'AUDITORIA_VER'"
    )
    await conn.query(
      "INSERT IGNORE INTO rol_permisos (id_rol, id_permiso) SELECT 4, id FROM permisos WHERE codigo = 'AUDITORIA_VER'"
    )
    console.log('✅ Permisos configurados')

    conn.release()
    console.log('✅ Tabla auditoria lista')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

recreateAuditoria()
