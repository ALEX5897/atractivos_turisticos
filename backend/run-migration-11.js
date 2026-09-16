require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

async function runMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'atractivos_turisticos',
    timezone: '-05:00',
    multipleStatements: false
  })

  try {
    const migrationPath = path.join(__dirname, '../database/migration_11_add_code_fields_to_experiencias.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')

    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    console.log('🔄 Ejecutando migración 11: Agregar campos de código a experiencias...')
    console.log(`📊 Total de statements: ${statements.length}`)

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      try {
        await conn.query(stmt)
        if (!stmt.toLowerCase().startsWith('select')) {
          console.log(`✓ [${i+1}/${statements.length}] ${stmt.substring(0, 60)}...`)
        }
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEY_NAME') {
          console.log(`⚠️ [${i+1}/${statements.length}] Campo/índice ya existe: ${err.message.substring(0, 50)}`)
        } else {
          throw err
        }
      }
    }

    console.log('\n✅ Migración 11 completada exitosamente')

    // Verificar que los campos se crearon
    const [columns] = await conn.query(`DESCRIBE experiencias`)
    const newFields = ['cod_parroquia', 'cod_modalidad', 'cod_nodo', 'cod_centralidad']
    const createdFields = columns.filter(col => newFields.includes(col.Field)).map(col => col.Field)

    console.log(`\n✅ Campos de código creados: ${createdFields.length}/${newFields.length}`)
    createdFields.forEach(field => console.log(`  ✓ ${field}`))

    await conn.end()
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Error ejecutando migración 11:', err.message)
    if (err.sql) {
      console.error('SQL:', err.sql.substring(0, 100))
    }
    await conn.end()
    process.exit(1)
  }
}

runMigration()
