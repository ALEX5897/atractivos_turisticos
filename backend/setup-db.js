require('dotenv').config()
const { pool } = require('./src/config/database')
const crypto = require('crypto')

async function setup() {
  try {
    console.log('Starting database setup...')
    console.log('DB_HOST:', process.env.DB_HOST)
    console.log('DB_USER:', process.env.DB_USER)
    console.log('DB_NAME:', process.env.DB_NAME)

    // Create usuarios table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(120),
        nombre VARCHAR(200),
        estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ Usuarios table created/verified')

    // Insert admin user (password: admin, SHA256 hash)
    const adminHash = crypto.createHash('sha256').update('admin').digest('hex')
    await pool.query(
      `INSERT IGNORE INTO usuarios (username, password_hash, email, nombre, estado)
       VALUES (?, ?, ?, ?, ?)`,
      ['admin', adminHash, 'admin@example.com', 'Admin User', 'activo']
    )
    console.log('✓ Admin user created/verified')

    console.log('\nDatabase setup complete!')
    console.log('You can now login with:')
    console.log('  Username: admin')
    console.log('  Password: admin')

    process.exit(0)
  } catch (err) {
    console.error('Setup error:', err.message)
    process.exit(1)
  }
}

setup()
