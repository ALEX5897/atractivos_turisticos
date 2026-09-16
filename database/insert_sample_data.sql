USE atractivos_turisticos;

-- Insertar categorías si no existen
INSERT IGNORE INTO cat_categorias (nombre, descripcion, activo) VALUES
('Natural', 'Atractivos de naturaleza', 1),
('Cultural', 'Atractivos culturales e históricos', 1);

-- Insertar tipos
INSERT IGNORE INTO cat_tipos (id_categoria, nombre, codigo, activo) VALUES
(1, 'Parque', 'PRK', 1),
(1, 'Laguna', 'LAG', 1),
(2, 'Iglesia', 'IGR', 1),
(2, 'Monumento', 'MON', 1);

-- Insertar parroquias
INSERT IGNORE INTO cat_parroquias (nombre, zona, tipo, activo) VALUES
('Cumbayá', 'NORTE', 'URBANA', 1),
('Quito Centro', 'CENTRO', 'URBANA', 1),
('San Isidro', 'NORTE', 'URBANA', 1),
('Calderón', 'NORTE', 'URBANA', 1),
('San Antonio de Pichincha', 'VALLES', 'RURAL', 1);

-- Insertar administraciones zonales
INSERT IGNORE INTO cat_administraciones_zonales (nombre, activo) VALUES
('Administración Zona La Mariscal', 1),
('Administración Zona Centro', 1),
('Administración Zona Norte', 1),
('Administración Zona Sur', 1),
('Administración Zona Valles', 1);

-- Insertar tipos de propietario
INSERT IGNORE INTO cat_tipos_propietario (nombre, activo) VALUES
('Público', 1),
('Privado', 1),
('Mixto', 1);

-- Insertar tipos de experiencia
INSERT IGNORE INTO cat_tipos_experiencia (nombre, descripcion, activo) VALUES
('Tour Guiado', 'Tours con guía turístico profesional', 1),
('Aventura', 'Actividades de aventura y adrenalina', 1),
('Gastronómico', 'Experiencias culinarias', 1),
('Cultural', 'Experiencias culturales e históricas', 1);

-- Insertar tipos de ruta
INSERT IGNORE INTO cat_tipos_ruta (nombre, descripcion, activo) VALUES
('Caminata', 'Rutas a pie', 1),
('Ciclismo', 'Rutas en bicicleta', 1),
('Trekking', 'Rutas de trekking', 1),
('Urbana', 'Rutas en la ciudad', 1);

-- Insertar idiomas
INSERT IGNORE INTO cat_idiomas (codigo, nombre, activo) VALUES
('ES', 'Español', 1),
('EN', 'Inglés', 1),
('FR', 'Francés', 1);

-- Insertar atractivos de ejemplo
INSERT IGNORE INTO atractivos (codigo, nombre, id_categoria, id_tipo, id_parroquia, id_adm_zonal, id_tipo_propietario, jerarquia, descripcion, estado)
VALUES
('ATR-001', 'Basílica del Voto Nacional', 2, 3, 2, 2, 1, 'NACIONAL', 'Templo de arquitectura eclesiástica ubicado en el Centro Histórico de Quito', 'ACTIVO'),
('ATR-002', 'Parque La Carolina', 1, 1, 1, 1, 1, 'REGIONAL', 'Parque urbano principal con zonas verdes y espacios recreativos', 'ACTIVO'),
('ATR-003', 'Centro Histórico de Quito', 2, 4, 2, 2, 1, 'NACIONAL', 'Sitio Patrimonio de la Humanidad con arquitectura colonial', 'ACTIVO'),
('ATR-004', 'Mitad del Mundo', 1, 1, 5, 5, 1, 'NACIONAL', 'Monumento ubicado sobre la línea ecuatorial', 'ACTIVO'),
('ATR-005', 'Teleférico de Quito', 1, 1, 1, 1, 2, 'REGIONAL', 'Teleférico que sube a 4050 msnm con vistas panorámicas', 'ACTIVO'),
('ATR-006', 'Iglesia de San Francisco', 2, 3, 2, 2, 1, 'REGIONAL', 'Iglesia colonial del siglo XVI con claustro museo', 'ACTIVO'),
('ATR-007', 'Parque Metropolitano', 1, 1, 3, 3, 1, 'LOCAL', 'Área protegida con senderos ecológicos y mirador de Quito', 'ACTIVO'),
('ATR-008', 'Laguna de Mica', 1, 2, 4, 5, 1, 'LOCAL', 'Cuerpo de agua natural en la zona valles', 'ACTIVO');

-- Insertar experiencias de ejemplo
INSERT IGNORE INTO experiencias (codigo, nombre, id_tipo_exp, id_atractivo, descripcion, duracion_horas, precio_desde, precio_hasta, moneda, estado)
VALUES
('EXP-001', 'Tour Basílica y Centro Histórico', 1, 1, 'Recorrido guiado por la Basílica y el Centro Histórico colonial', 3.0, 25.00, 35.00, 'USD', 'ACTIVO'),
('EXP-002', 'Aventura en La Carolina', 2, 2, 'Actividades deportivas y recreativas', 2.5, 20.00, 30.00, 'USD', 'ACTIVO'),
('EXP-003', 'Tour Mitad del Mundo', 1, 4, 'Visita al monumento con museo e interactividades', 2.0, 15.00, 25.00, 'USD', 'ACTIVO'),
('EXP-004', 'Senderismo Metropolitano', 2, 7, 'Caminata ecológica por senderos naturales', 4.0, 30.00, 45.00, 'USD', 'ACTIVO'),
('EXP-005', 'Subida en Teleférico', 1, 5, 'Experiencia de ascenso panorámico', 1.5, 12.00, 18.00, 'USD', 'ACTIVO'),
('EXP-006', 'Tour de Iglesias Coloniales', 1, 6, 'Recorrido por iglesias históricas', 2.5, 20.00, 30.00, 'USD', 'ACTIVO');

-- Insertar rutas de ejemplo
INSERT IGNORE INTO rutas (codigo, nombre, id_tipo_ruta, descripcion, dificultad, duracion_horas, distancia_km, estado)
VALUES
('RUT-001', 'Ruta Histórica de Quito', 4, 'Recorrido por sitios históricos', 'FACIL', 3.0, 2.5, 'ACTIVO'),
('RUT-002', 'Ruta Naturaleza y Aventura', 1, 'Caminata con vistas panorámicas', 'MODERADO', 4.0, 6.0, 'ACTIVO'),
('RUT-003', 'Ruta Monumentos Principales', 4, 'Visita a monumentos principales', 'FACIL', 5.0, 8.0, 'ACTIVO'),
('RUT-004', 'Ruta Cultura y Gastronomía', 4, 'Tour cultural con experiencias gastronómicas', 'FACIL', 4.0, 3.5, 'ACTIVO'),
('RUT-005', 'Ruta Aventura Extrema', 1, 'Ruta para aventureros', 'DIFICIL', 6.0, 10.0, 'ACTIVO');
