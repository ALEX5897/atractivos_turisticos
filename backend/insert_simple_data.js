require('dotenv').config({ path: './.env' })
const mysql = require('mysql2/promise')

async function insertData() {
  let conn
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    console.log('Insertando datos de ejemplo...')

    // Insertar categorías
    await conn.query(
      `INSERT IGNORE INTO cat_categorias (nombre, descripcion, activo) VALUES
       ('Natural', 'Atractivos de naturaleza', 1),
       ('Cultural', 'Atractivos culturales e históricos', 1)`
    )

    // Insertar tipos
    await conn.query(
      `INSERT IGNORE INTO cat_tipos (id_categoria, nombre, codigo, activo) VALUES
       (1, 'Parque', 'PRK', 1),
       (1, 'Laguna', 'LAG', 1),
       (2, 'Iglesia', 'IGR', 1),
       (2, 'Monumento', 'MON', 1)`
    )

    // Insertar parroquias
    await conn.query(
      `INSERT IGNORE INTO cat_parroquias (nombre, zona, tipo, activo) VALUES
       ('Cumbayá', 'NORTE', 'URBANA', 1),
       ('Quito Centro', 'CENTRO', 'URBANA', 1),
       ('San Isidro', 'NORTE', 'URBANA', 1)`
    )

    // Insertar administraciones
    await conn.query(
      `INSERT IGNORE INTO cat_administraciones_zonales (nombre, activo) VALUES
       ('Zona Centro', 1),
       ('Zona Norte', 1),
       ('Zona Valles', 1)`
    )

    // Insertar tipos de propietario
    await conn.query(
      `INSERT IGNORE INTO cat_tipos_propietario (nombre, activo) VALUES
       ('Público', 1),
       ('Privado', 1)`
    )

    // Insertar tipos de experiencia
    await conn.query(
      `INSERT IGNORE INTO cat_tipos_experiencia (nombre, descripcion, activo) VALUES
       ('Tour Guiado', 'Tours con guía turístico', 1),
       ('Aventura', 'Actividades de aventura', 1),
       ('Cultural', 'Experiencias culturales', 1)`
    )

    // Insertar tipos de ruta
    await conn.query(
      `INSERT IGNORE INTO cat_tipos_ruta (nombre, descripcion, activo) VALUES
       ('Caminata', 'Rutas a pie', 1),
       ('Urbana', 'Rutas en la ciudad', 1),
       ('Naturaleza', 'Rutas naturales', 1)`
    )

    // Insertar idiomas
    await conn.query(
      `INSERT IGNORE INTO cat_idiomas (codigo, nombre, activo) VALUES
       ('ES', 'Español', 1),
       ('EN', 'Inglés', 1)`
    )

    // Insertar atractivos
    await conn.query(
      `INSERT IGNORE INTO atractivos (codigo, nombre, id_categoria, id_tipo, id_parroquia, id_adm_zonal, id_tipo_propietario, jerarquia, breve_descripcion, estado) VALUES
       ('ATR-001', 'Basílica del Voto Nacional', 2, 3, 2, 1, 1, 1, 'Templo eclesiástico en el Centro Histórico', 'ACTIVO'),
       ('ATR-002', 'Parque La Carolina', 1, 1, 1, 2, 1, 2, 'Parque urbano principal con zonas verdes', 'ACTIVO'),
       ('ATR-003', 'Centro Histórico', 2, 4, 2, 1, 1, 1, 'Sitio Patrimonio de la Humanidad', 'ACTIVO'),
       ('ATR-004', 'Mitad del Mundo', 1, 1, 3, 3, 1, 1, 'Monumento en la línea ecuatorial', 'ACTIVO'),
       ('ATR-005', 'Parque Metropolitano', 1, 1, 1, 2, 1, 2, 'Área protegida con senderos', 'ACTIVO'),
       ('ATR-006', 'Iglesia San Francisco', 2, 3, 2, 1, 1, 2, 'Iglesia colonial con claustro museo', 'ACTIVO')`
    )

    // Insertar experiencias
    await conn.query(
      `INSERT IGNORE INTO experiencias (codigo, nombre, id_tipo_exp, id_atractivo, breve_descripcion_y_actividades_a_realizar, tiempo_de_duracion, estado_experiencia) VALUES
       ('EXP-001', 'Tour Basílica y Centro Histórico', 1, 1, 'Recorrido guiado por la Basílica', '3', 'ACTIVO'),
       ('EXP-002', 'Aventura en La Carolina', 2, 2, 'Actividades deportivas y recreativas', '2.5', 'ACTIVO'),
       ('EXP-003', 'Tour Mitad del Mundo', 1, 4, 'Visita al monumento con actividades', '2', 'ACTIVO'),
       ('EXP-004', 'Senderismo Metropolitano', 2, 5, 'Caminata ecológica por senderos', '4', 'ACTIVO'),
       ('EXP-005', 'Tour Iglesias Coloniales', 1, 6, 'Recorrido por iglesias históricas', '2.5', 'ACTIVO')`
    )

    // Insertar rutas
    await conn.query(
      `INSERT IGNORE INTO rutas (codigo, nombre, id_tipo_ruta, dificultad, tiempo_de_duracion_de_ruta_horas, distancia_km, breve_descripcion, estado) VALUES
       ('RUT-001', 'Ruta Histórica de Quito', 2, 'FACIL', '3', '2.5', 'Recorrido por sitios históricos', 'ACTIVO'),
       ('RUT-002', 'Ruta Naturaleza y Aventura', 1, 'MODERADO', '4', '6', 'Caminata con vistas panorámicas', 'ACTIVO'),
       ('RUT-003', 'Ruta Monumentos Principales', 2, 'FACIL', '5', '8', 'Visita a monumentos principales', 'ACTIVO'),
       ('RUT-004', 'Ruta Aventura Extrema', 1, 'DIFICIL', '6', '10', 'Ruta para aventureros', 'ACTIVO')`
    )

    console.log('✓ Datos insertados exitosamente')

    // Mostrar conteos
    const [[{ total: atractivos }]] = await conn.query('SELECT COUNT(*) AS total FROM atractivos WHERE estado != "ELIMINADO"')
    const [[{ total: experiencias }]] = await conn.query('SELECT COUNT(*) AS total FROM experiencias WHERE estado_experiencia != "ELIMINADO" OR estado_experiencia IS NULL')
    const [[{ total: rutas }]] = await conn.query('SELECT COUNT(*) AS total FROM rutas WHERE estado != "ELIMINADO"')

    console.log(`\n📊 Datos cargados:`)
    console.log(`  - Atractivos: ${atractivos}`)
    console.log(`  - Experiencias: ${experiencias}`)
    console.log(`  - Rutas: ${rutas}`)
    console.log(`\n✅ El sistema está listo. Abre http://localhost:5173 en tu navegador`)

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    if (conn) await conn.end()
  }
}

insertData()
