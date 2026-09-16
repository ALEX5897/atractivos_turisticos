const mysql = require('mysql2/promise')
const crypto = require('crypto')

async function createAdminUser() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'QT426*',
    database: process.env.DB_NAME || 'atractivos_turisticos',
  })

  try {
    const conn = await pool.getConnection()

    const username = 'admin'
    const password = 'admin123'
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

    try {
      await conn.query(
        'INSERT INTO usuarios (username, email, password_hash, nombre, estado) VALUES (?, ?, ?, ?, ?)',
        [username, 'admin@quito-turismo.gob.ec', passwordHash, 'Administrador del Sistema', 'activo']
      )
      console.log(`✓ Usuario administrador creado`)
      console.log(`  Usuario: ${username}`)
      console.log(`  Contraseña: ${password}`)
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`✓ Usuario "admin" ya existe`)
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

createAdminUser()
