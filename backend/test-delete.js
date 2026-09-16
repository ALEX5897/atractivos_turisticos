const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'atractivos_turisticos',
  user: 'root',
  password: 'QT426*',
})

async function test() {
  const conn = await pool.getConnection()
  try {
    console.log('Probando DELETE de ID 223...\n')

    const [result] = await conn.query(
      `UPDATE atractivos SET estado = 'ELIMINADO', actualizado_por = ?
       WHERE id_atractivo = ? AND estado != 'ELIMINADO'`,
      ['admin', 223]
    )

    console.log('Resultado:', result)
    console.log('affectedRows:', result.affectedRows)

    if (result.affectedRows === 0) {
      console.log('\n⚠️  No se encontró el registro o ya está eliminado')
    } else {
      console.log('\n✓ Atractivo eliminado correctamente')
    }

    // Verificar estado actual
    const [rows] = await conn.query(
      'SELECT id_atractivo, n, nombre, estado FROM atractivos WHERE id_atractivo = 223'
    )
    console.log('\nEstado actual del registro:')
    if (rows.length > 0) {
      console.log(`ID: ${rows[0].id_atractivo}, N: ${rows[0].n}, Estado: ${rows[0].estado}`)
    } else {
      console.log('Registro no encontrado')
    }

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

test()
