const mysql = require('mysql2/promise')

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

async function insertTestData() {
  const conn = await pool.getConnection()
  try {
    console.log('\n📥 INSERTANDO DATOS DE PRUEBA\n')
    console.log('═'.repeat(60))

    let totalInserted = 0

    // ============================
    // 1. ATRACTIVOS
    // ============================
    console.log('\n🏔️  Insertando Atractivos...\n')

    const atractivosData = [
      {
        codigo: 'ATR-001',
        nombre: 'Volcán Pichincha',
        id_categoria: 1,
        id_tipo: 1,
        jerarquia: 4,
        id_parroquia: 3,
        id_adm_zonal: 3,
        direccion: 'Acceso desde Centro Histórico',
        latitud: -0.2135,
        longitud: -78.4960,
        altitud_msnm: 4784,
        breve_descripcion: 'Volcán activo con vistas panorámicas de Quito. Accesible mediante teleférico.',
        historia: 'Sagrado para los pueblos indígenas de la región',
        telefono: '+593 2 2333 666',
        sitio_web: 'www.teleferiquto.com',
        accesible_movilidad: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ATR-002',
        nombre: 'Centro Histórico de Quito',
        id_categoria: 2,
        id_tipo: 1,
        jerarquia: 4,
        id_parroquia: 3,
        id_adm_zonal: 3,
        direccion: 'Centro de Quito',
        latitud: -0.2166,
        longitud: -78.5060,
        altitud_msnm: 2850,
        breve_descripcion: 'Uno de los centros históricos mejor conservados. Patrimonio de la Humanidad desde 1978.',
        historia: 'Fundada en 1534, capital de la Audiencia Real de Quito',
        email: 'info@centrohistorico.ec',
        sitio_web: 'www.centrohistorico.com',
        accesible_movilidad: true,
        senaletica: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'ATR-003',
        nombre: 'Laguna de Cuicocha',
        id_categoria: 1,
        id_tipo: 1,
        jerarquia: 3,
        id_parroquia: 1,
        id_adm_zonal: 1,
        direccion: 'Vía a Ibarra',
        latitud: 0.3167,
        longitud: -78.3667,
        altitud_msnm: 3064,
        breve_descripcion: 'Laguna cratérica con islas e increíbles senderos de trekking',
        historia: 'Antigua caldera volcánica',
        telefono: '+593 6 2923 400',
        estado: 'ACTIVO',
      },
    ]

    let atractCount = 0
    for (const atractivo of atractivosData) {
      const [result] = await conn.query(
        `INSERT INTO atractivos
         (codigo, nombre, id_categoria, id_tipo, jerarquia, id_parroquia, id_adm_zonal,
          direccion, latitud, longitud, altitud_msnm, breve_descripcion, historia,
          telefono, email, sitio_web, accesible_movilidad, accesible_visual,
          accesible_auditiva, accesible_cognitiva, senaletica, baterias_sanitarias,
          estacionamiento, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          atractivo.codigo,
          atractivo.nombre,
          atractivo.id_categoria,
          atractivo.id_tipo,
          atractivo.jerarquia,
          atractivo.id_parroquia,
          atractivo.id_adm_zonal,
          atractivo.direccion,
          atractivo.latitud,
          atractivo.longitud,
          atractivo.altitud_msnm,
          atractivo.breve_descripcion,
          atractivo.historia,
          atractivo.telefono || null,
          atractivo.email || null,
          atractivo.sitio_web || null,
          atractivo.accesible_movilidad ? 1 : 0,
          atractivo.accesible_visual ? 1 : 0,
          atractivo.accesible_auditiva ? 1 : 0,
          atractivo.accesible_cognitiva ? 1 : 0,
          atractivo.senaletica ? 1 : 0,
          atractivo.baterias_sanitarias ? 1 : 0,
          atractivo.estacionamiento ? 1 : 0,
          atractivo.estado,
        ]
      )
      atractCount++
      console.log(`  ✓ ${atractivo.nombre}`)
    }
    console.log(`\n  Total: ${atractCount} atractivos insertados\n`)
    totalInserted += atractCount

    // ============================
    // 2. EXPERIENCIAS
    // ============================
    console.log('🎯 Insertando Experiencias...\n')

    const experienciasData = [
      {
        codigo: 'EXP-001',
        nombre: 'Tour Gastronomía Quiteña',
        id_tipo_exp: 3,
        id_atractivo: 1,
        breve_descripcion_y_actividades_a_realizar:
          'Recorrido por los mejores restaurantes tradicionales de Quito',
        duracion_horas: 3.5,
        latitud: -0.2166,
        longitud: -78.5060,
        precio_desde: 45.0,
        precio_hasta: 65.0,
        capacidad: '2-8',
        horario_de_atencion: '11:00-14:30, 18:00-21:30',
        incluye: 'Transporte, guía, degustación de 3 platos',
        no_incluye: 'Bebidas alcohólicas, propinas',
        restricciones: 'Confirmar con 24 horas de anticipación',
        operador_nombre: 'Quito Tours',
        operador_ruc: '1790123456789',
        operador_telefono: '+593 2 2555 666',
        operador_email: 'info@quitotours.ec',
        operador_web: 'www.quitotours.ec',
        accesible: true,
        estado_experiencia: 'ACTIVO',
      },
      {
        codigo: 'EXP-002',
        nombre: 'Senderismo Pichincha',
        id_tipo_exp: 2,
        id_atractivo: 1,
        breve_descripcion_y_actividades_a_realizar:
          'Ascenso a la cumbre del Volcán Pichincha con guía experto',
        duracion_horas: 6.0,
        latitud: -0.2135,
        longitud: -78.4960,
        precio_desde: 35.0,
        precio_hasta: 55.0,
        capacidad: '2-10',
        horario_de_atencion: '07:00-13:00',
        incluye: 'Transporte ida/vuelta, guía, snacks, agua',
        no_incluye: 'Almuerzo, equipo técnico',
        restricciones: 'Buen estado físico, ropa deportiva',
        operador_nombre: 'Adventure Ecuador',
        operador_ruc: '1790234567890',
        operador_telefono: '+593 2 3331 111',
        operador_email: 'aventura@adventureec.com',
        operador_web: 'www.adventureecuador.com',
        accesible: false,
        estado_experiencia: 'ACTIVO',
      },
    ]

    let expCount = 0
    for (const exp of experienciasData) {
      const [result] = await conn.query(
        `INSERT INTO experiencias
         (codigo, nombre, id_tipo_exp, id_atractivo, breve_descripcion_y_actividades_a_realizar,
          duracion_horas, latitud, longitud, precio_desde, precio_hasta, capacidad,
          horario_de_atencion, incluye, no_incluye, restricciones, operador_nombre,
          operador_ruc, operador_telefono, operador_email, operador_web, accesible,
          estado_experiencia)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exp.codigo,
          exp.nombre,
          exp.id_tipo_exp,
          exp.id_atractivo,
          exp.breve_descripcion_y_actividades_a_realizar,
          exp.duracion_horas,
          exp.latitud,
          exp.longitud,
          exp.precio_desde,
          exp.precio_hasta,
          exp.capacidad,
          exp.horario_de_atencion,
          exp.incluye,
          exp.no_incluye,
          exp.restricciones,
          exp.operador_nombre,
          exp.operador_ruc,
          exp.operador_telefono,
          exp.operador_email,
          exp.operador_web,
          exp.accesible ? 1 : 0,
          exp.estado_experiencia,
        ]
      )
      expCount++
      console.log(`  ✓ ${exp.nombre}`)
    }
    console.log(`\n  Total: ${expCount} experiencias insertadas\n`)
    totalInserted += expCount

    // ============================
    // 3. RUTAS
    // ============================
    console.log('🗺️  Insertando Rutas...\n')

    const rutasData = [
      {
        codigo: 'RUT-001',
        nombre: 'Ruta Centro Histórico y Miradores',
        id_tipo_ruta: 1,
        descripcion: 'Recorrido por los principales atractivos culturales e históricos de Quito',
        dificultad: 'FACIL',
        duracion_horas: 4.0,
        distancia_km: 12.5,
        desnivel_positivo: 200,
        desnivel_negativo: 200,
        altitud_min: 2800,
        altitud_max: 3100,
        punto_inicio_nombre: 'Plaza Grande',
        punto_inicio_lat: -0.2166,
        punto_inicio_lng: -78.5060,
        punto_fin_nombre: 'Mirador de Guápulo',
        punto_fin_lat: -0.2234,
        punto_fin_lng: -78.4960,
        url_mapa: 'https://maps.google.com',
        mejor_epoca: 'Junio - Agosto',
        recomendaciones: 'Usar zapatos cómodos, llevar agua',
        incluye: 'Transporte, guía turístico, entrada a iglesias',
        no_incluye: 'Almuerzo, propinas',
        precio_desde: 50.0,
        precio_hasta: 75.0,
        accesible: true,
        estado: 'ACTIVO',
      },
      {
        codigo: 'RUT-002',
        nombre: 'Ruta de Naturaleza Andina',
        id_tipo_ruta: 2,
        descripcion: 'Senderismo por las laderas de volcanes y bosques nublados',
        dificultad: 'MODERADO',
        duracion_horas: 6.0,
        distancia_km: 15.0,
        desnivel_positivo: 500,
        desnivel_negativo: 500,
        altitud_min: 3000,
        altitud_max: 3800,
        punto_inicio_nombre: 'Parque Metropolitano',
        punto_inicio_lat: -0.2298,
        punto_inicio_lng: -78.5249,
        punto_fin_nombre: 'Laguna de Mica',
        punto_fin_lat: -0.2400,
        punto_fin_lng: -78.5350,
        mejor_epoca: 'Septiembre - Diciembre',
        recomendaciones: 'Llevar chaqueta impermeable, protector solar',
        incluye: 'Guía experto, snacks, bastones de trekking',
        no_incluye: 'Transporte, almuerzo',
        precio_desde: 60.0,
        precio_hasta: 90.0,
        accesible: false,
        estado: 'ACTIVO',
      },
    ]

    let rutasCount = 0
    for (const ruta of rutasData) {
      const [result] = await conn.query(
        `INSERT INTO rutas
         (codigo, nombre, id_tipo_ruta, descripcion, dificultad, duracion_horas,
          distancia_km, desnivel_positivo, desnivel_negativo, altitud_min, altitud_max,
          punto_inicio_nombre, punto_inicio_lat, punto_inicio_lng, punto_fin_nombre,
          punto_fin_lat, punto_fin_lng, url_mapa, mejor_epoca, recomendaciones, incluye,
          no_incluye, precio_desde, precio_hasta, accesible, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ruta.codigo,
          ruta.nombre,
          ruta.id_tipo_ruta,
          ruta.descripcion,
          ruta.dificultad,
          ruta.duracion_horas,
          ruta.distancia_km,
          ruta.desnivel_positivo,
          ruta.desnivel_negativo,
          ruta.altitud_min,
          ruta.altitud_max,
          ruta.punto_inicio_nombre,
          ruta.punto_inicio_lat,
          ruta.punto_inicio_lng,
          ruta.punto_fin_nombre,
          ruta.punto_fin_lat,
          ruta.punto_fin_lng,
          ruta.url_mapa,
          ruta.mejor_epoca,
          ruta.recomendaciones,
          ruta.incluye,
          ruta.no_incluye,
          ruta.precio_desde,
          ruta.precio_hasta,
          ruta.accesible ? 1 : 0,
          ruta.estado,
        ]
      )
      rutasCount++
      console.log(`  ✓ ${ruta.nombre}`)
    }
    console.log(`\n  Total: ${rutasCount} rutas insertadas\n`)
    totalInserted += rutasCount

    // Resumen final
    console.log('═'.repeat(60))
    console.log(`\n✅ DATOS DE PRUEBA INSERTADOS EXITOSAMENTE\n`)
    console.log(`📊 Resumen:`)
    console.log(`  • Atractivos:   ${atractCount}`)
    console.log(`  • Experiencias: ${expCount}`)
    console.log(`  • Rutas:        ${rutasCount}`)
    console.log(`  ────────────────`)
    console.log(`  Total:          ${totalInserted}\n`)
    console.log('Ya puedes probar la aplicación con estos datos de prueba ✨\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Error al insertar datos:', err.message)
    console.error(err.stack)
    process.exit(1)
  } finally {
    await conn.end()
    await pool.end()
  }
}

insertTestData()
