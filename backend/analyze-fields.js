const XLSX = require('xlsx')
const mysql = require('mysql2/promise')
const path = require('path')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'atractivos_turisticos',
  user: 'root',
  password: 'QT426*',
  waitForConnections: true,
})

const docsBase = path.join(__dirname, '../documentos_base')

async function analyzeFields() {
  console.log('\n📊 ANÁLISIS DE CAMPOS: EXCEL vs BD vs FORMULARIO\n')
  console.log('='.repeat(100))

  // Leer Excel
  const files = {
    atractivos: 'ATRACTIVOS TURÍSTICOS CODIFICACIÓN ABRIL 2026.xlsx',
    experiencias: 'EXPERIENCIAS TURÍSTICAS CODIFICACIÓN ABRIL 2026.xlsx',
    rutas: 'RUTAS TURÍSTICAS CODIFICACIÓN ABRIL 2026.xlsx',
  }

  const conn = await pool.getConnection()

  for (const [type, filename] of Object.entries(files)) {
    console.log(`\n📄 ${type.toUpperCase()}\n`)

    // Excel fields
    const filepath = path.join(docsBase, filename)
    const workbook = XLSX.readFile(filepath)
    const sheetName = type.charAt(0).toUpperCase() + type.slice(1)
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)
    const excelFields = Object.keys(data[0] || {})

    console.log(`Excel (${excelFields.length} campos):`)
    excelFields.forEach((f, i) => {
      console.log(`  ${String(i + 1).padStart(2, ' ')}. ${f}`)
    })

    // BD fields
    const [columns] = await conn.query(`DESCRIBE ${type}`)
    const bdFields = columns.map((c) => c.Field)
    console.log(`\nBD (${bdFields.length} campos, principales):`)
    const fieldsToShow = [
      'codigo',
      'nombre',
      'id_categoria',
      'id_tipo',
      'jerarquia',
      'id_parroquia',
      'latitud',
      'longitud',
      'direccion',
      'horario',
      'breve_descripcion',
      'historia',
      'estado',
      'n',
      'parroquia',
      'nodo',
      'centralidad',
      'subcentralidad',
      'categoria',
      'tipo',
      'sub_tipo',
      'publica',
      'servicios_incluidos',
      'acceso_de_transporte',
      'restriccion_a_la_accesibilidad',
      'pet_friendly',
      'contacto_telefono_correo_electronico',
      'dpa_manzana_localidad_del_atractivo',
      'altitud_msnm',
      'telefono',
      'email',
      'sitio_web',
      'accesible_movilidad',
      'accesible_visual',
      'accesible_auditiva',
      'accesible_cognitiva',
      'senaletica',
      'baterias_sanitarias',
      'estacionamiento',
    ]

    fieldsToShow.forEach((f) => {
      const exists = bdFields.includes(f) ? '✓' : '✗'
      console.log(`  ${exists} ${f}`)
    })

    console.log('\n' + '-'.repeat(100))
  }

  await conn.end()
  await pool.end()
}

analyzeFields()
