const mysql = require('mysql2/promise')
const crypto = require('crypto')

async function createUsersTable() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'QT426*',
    database: process.env.DB_NAME || 'atractivos_turisticos',
  })

  try {
    const conn = await pool.getConnection()

    // Crear tabla usuarios
    await conn.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(100),
        estado ENUM('activo', 'inactivo') DEFAULT 'activo',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    console.log('✓ Tabla "usuarios" creada exitosamente')

    // Crear usuario de prueba
    const username = 'acasa'
    const password = '@Samu_110516'
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

    try {
      await conn.query(
        'INSERT INTO usuarios (username, email, password_hash, nombre, estado) VALUES (?, ?, ?, ?, ?)',
        [username, 'acasa@test.local', passwordHash, 'Admin Casachana', 'activo']
      )
      console.log(`✓ Usuario de prueba creado: ${username}`)
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`✓ Usuario "${username}" ya existe`)
      } else {
        throw err
      }
    }

    conn.release()
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await pool.end()
  }
}

createUsersTable()
