const mysql = require('mysql2/promise')
const crypto = require('crypto')

async function verifyUsers() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'QT426*',
    database: process.env.DB_NAME || 'atractivos_turisticos',
  })

  try {
    const conn = await pool.getConnection()

    const [users] = await conn.query('SELECT id, username, email, estado FROM usuarios')
    console.log('Usuarios en BD:')
    users.forEach(u => {
      console.log(`  - ${u.username} (${u.email}) - ${u.estado}`)
    })

    // Verificar hash de admin
    const adminPassword = 'admin123'
    const adminHash = crypto.createHash('sha256').update(adminPassword).digest('hex')
    console.log('\nHash esperado para "admin123":')
    console.log(' ', adminHash)

    const [adminUser] = await conn.query('SELECT password_hash FROM usuarios WHERE username = ?', ['admin'])
    if (adminUser.length > 0) {
      console.log('Hash en BD para usuario "admin":')
      console.log(' ', adminUser[0].password_hash)
      console.log('¿Coinciden?', adminUser[0].password_hash === adminHash ? 'SÍ ✓' : 'NO ✗')
    }

    conn.release()
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await pool.end()
  }
}

verifyUsers()
