const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'atractivos_turisticos',
  user: 'root',
  password: 'QT426*',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

async function runMigration() {
  const conn = await pool.getConnection()
  try {
    console.log('Iniciando migración 15: Tablas de usuarios y roles...\n')

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'migration_15_usuarios_roles.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Ejecutar SQL dividiendo por puntos y comas
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    for (const statement of statements) {
      console.log(`Ejecutando: ${statement.substring(0, 60)}...`)
      try {
        await conn.query(statement)
        console.log('  ✓ Completado\n')
      } catch (err) {
        console.log(`  ⚠ Error: ${err.message}\n`)
      }
    }

    // Verificar tablas creadas
    console.log('\n=== Verificación de Tablas ===\n')

    const tables = ['roles', 'permisos', 'rol_permisos']
    for (const table of tables) {
      const [rows] = await conn.query(`SELECT COUNT(*) as count FROM ${table}`)
      console.log(`✓ Tabla ${table}: ${rows[0].count} registros`)
    }

    // Verificar usuarios con rol asignado
    const [usuarios] = await conn.query(`SELECT COUNT(*) as count FROM usuarios WHERE id_rol IS NOT NULL`)
    console.log(`✓ Usuarios con rol asignado: ${usuarios[0].count}`)

    // Mostrar roles creados
    console.log('\n=== Roles Creados ===\n')
    const [rolesData] = await conn.query(`
      SELECT r.id, r.nombre, r.descripcion, COUNT(rp.id_permiso) as permisos_count
      FROM roles r
      LEFT JOIN rol_permisos rp ON r.id = rp.id_rol
      GROUP BY r.id
    `)
    rolesData.forEach(role => {
      console.log(`${role.id}. ${role.nombre}: ${role.permisos_count} permisos`)
      console.log(`   ${role.descripcion}`)
    })

    console.log('\n✓ Migración 15 completada exitosamente')
    process.exit(0)
  } catch (err) {
    console.error('\n✗ Error durante la migración:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

runMigration()
