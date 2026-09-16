const XLSX = require('xlsx')
const path = require('path')

const docsBase = path.join(__dirname, '../documentos_base')

const files = {
  atractivos: 'ATRACTIVOS TURÍSTICOS CODIFICACIÓN ABRIL 2026.xlsx',
  experiencias: 'EXPERIENCIAS TURÍSTICAS CODIFICACIÓN ABRIL 2026.xlsx',
  rutas: 'RUTAS TURÍSTICAS CODIFICACIÓN ABRIL 2026.xlsx',
}

console.log('\n📊 ANÁLISIS DE ARCHIVOS EXCEL\n')
console.log('='.repeat(80))

Object.entries(files).forEach(([key, filename]) => {
  const filepath = path.join(docsBase, filename)
  console.log(`\n📄 ${filename}`)
  console.log('-'.repeat(80))

  try {
    const workbook = XLSX.readFile(filepath)
    console.log(`✓ Hojas disponibles: ${workbook.SheetNames.join(', ')}`)

    // Usar la hoja específica según el tipo
    let sheetName = key.charAt(0).toUpperCase() + key.slice(1)
    if (!workbook.SheetNames.includes(sheetName)) {
      sheetName = workbook.SheetNames.find(
        (s) => s.toLowerCase() === key.toLowerCase()
      )
    }

    if (!sheetName) {
      console.log(`❌ No se encontró hoja para ${key}`)
      return
    }

    console.log(`✓ Usando hoja: "${sheetName}"`)
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)

    if (data.length === 0) {
      console.log('⚠️  No hay datos en la hoja')
      return
    }

    const firstRow = data[0]
    const headers = Object.keys(firstRow)

    console.log(`\n📋 Campos (${headers.length}):`)
    headers.forEach((h, i) => {
      console.log(`  ${String(i + 1).padStart(2, ' ')}. ${h}`)
    })

    console.log(`\n📈 Total de registros: ${data.length}`)

    console.log(`\n📝 Primer registro:`)
    headers.forEach((h) => {
      const val = firstRow[h]
      const display = typeof val === 'object' ? JSON.stringify(val) : val
      console.log(`  ${h}: ${display}`)
    })
  } catch (err) {
    console.error(`❌ Error: ${err.message}`)
  }
})

console.log('\n' + '='.repeat(80) + '\n')
