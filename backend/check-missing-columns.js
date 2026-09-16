const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'atractivos_turisticos',
  user: 'root',
  password: 'QT426*',
})

async function checkColumns() {
  const conn = await pool.getConnection()
  try {
    const [columns] = await conn.query('DESCRIBE atractivos')
    const existingColumns = columns.map(c => c.Field)

    const requiredColumns = [
      'parroquia', 'nodo', 'centralidad', 'subcentralidad',
      'categoria', 'tipo', 'sub_tipo', 'publica', 'privada',
      'breve_descripcion', 'servicios_incluidos', 'acceso_de_transporte',
      'restriccion_a_la_accesibilidad', 'pet_friendly',
      'contacto_telefono_correo_electronico', 'dpa_manzana_localidad_del_atractivo',
      'observacion_de_inactivacion'
    ]

    console.log('Columnas existentes en atractivos:')
    existingColumns.forEach(col => console.log(`  ✓ ${col}`))

    console.log('\nColumnas requeridas vs existentes:')
    const missing = []
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`  ✓ ${col}`)
      } else {
        console.log(`  ✗ ${col} (FALTA)`)
        missing.push(col)
      }
    })

    if (missing.length > 0) {
      console.log(`\nFaltan ${missing.length} columnas:`, missing.join(', '))
    } else {
      console.log('\n✓ Todas las columnas requeridas existen')
    }

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

checkColumns()
