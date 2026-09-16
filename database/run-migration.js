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
    console.log('Iniciando migración de padding de códigos...\n')

    // Ejecutar cada UPDATE por separado
    const updates = [
      { tabla: 'cat_nodos', campo: 'cod_nodo' },
      { tabla: 'cat_centralidades', campo: 'cod_centralidad' },
      { tabla: 'cat_tipos', campo: 'cod_tipo' },
      { tabla: 'cat_subtipos', campo: 'cod_subtipo' },
      { tabla: 'cat_dpa', campo: 'cod_dpa' },
      { tabla: 'cat_categorias', campo: 'cod_categoria' },
      { tabla: 'cat_modalidades', campo: 'cod_modalidad' },
    ]

    for (const { tabla, campo } of updates) {
      console.log(`Actualizando ${tabla}.${campo}...`)
      const sql = `UPDATE ${tabla}
        SET ${campo} = CONCAT('0', ${campo})
        WHERE ${campo} REGEXP '^[1-9]$'`

      const [result] = await conn.query(sql)
      console.log(`  ✓ ${result.affectedRows} registros actualizados\n`)
    }

    console.log('Verificando resultados...\n')

    // Verificar resultados
    for (const { tabla, campo } of updates) {
      const [rows] = await conn.query(
        `SELECT ${campo} as codigo, COUNT(*) as cantidad
         FROM ${tabla}
         WHERE ${campo} IS NOT NULL
         GROUP BY ${campo}
         ORDER BY ${campo}`
      )

      if (rows.length > 0) {
        console.log(`${tabla}:`)
        rows.forEach(row => {
          console.log(`  ${row.codigo}: ${row.cantidad} registros`)
        })
        console.log()
      }
    }

    console.log('✓ Migración completada exitosamente')
    process.exit(0)
  } catch (err) {
    console.error('✗ Error durante la migración:', err.message)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

runMigration()
