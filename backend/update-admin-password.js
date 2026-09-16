require('dotenv').config()
const { pool } = require('./src/config/database')
const crypto = require('crypto')

async function updatePassword() {
  try {
    const password = 'admin'
    const hash = crypto.createHash('sha256').update(password).digest('hex')

    console.log('Updating admin password...')
    console.log('Password: admin')
    console.log('Hash:', hash)

    await pool.query(
      'UPDATE usuarios SET password_hash = ? WHERE username = ?',
      [hash, 'admin']
    )

    console.log('✓ Admin password updated')
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

updatePassword()
