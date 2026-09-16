-- ============================================================
-- MIGRACIÓN: Agregar campos de Puntos de Inicio y Fin a rutas
-- ============================================================

ALTER TABLE rutas ADD COLUMN (
  punto_inicio_nombre VARCHAR(200) DEFAULT NULL COMMENT 'Nombre del punto de inicio',
  punto_inicio_lat DECIMAL(10,7) DEFAULT NULL COMMENT 'Latitud del punto de inicio',
  punto_inicio_lng DECIMAL(10,7) DEFAULT NULL COMMENT 'Longitud del punto de inicio',
  punto_fin_nombre VARCHAR(200) DEFAULT NULL COMMENT 'Nombre del punto de fin',
  punto_fin_lat DECIMAL(10,7) DEFAULT NULL COMMENT 'Latitud del punto de fin',
  punto_fin_lng DECIMAL(10,7) DEFAULT NULL COMMENT 'Longitud del punto de fin'
);

-- Agregar campos faltantes a experiencias también
ALTER TABLE experiencias ADD COLUMN (
  latitud DECIMAL(10,7) DEFAULT NULL COMMENT 'Latitud',
  longitud DECIMAL(10,7) DEFAULT NULL COMMENT 'Longitud',
  duracion_horas DECIMAL(5,2) DEFAULT NULL COMMENT 'Duración en horas',
  precio_desde DECIMAL(10,2) DEFAULT NULL COMMENT 'Precio mínimo',
  precio_hasta DECIMAL(10,2) DEFAULT NULL COMMENT 'Precio máximo',
  incluye TEXT DEFAULT NULL COMMENT 'Qué incluye',
  no_incluye TEXT DEFAULT NULL COMMENT 'Qué no incluye',
  operador_nombre VARCHAR(200) DEFAULT NULL,
  operador_ruc VARCHAR(13) DEFAULT NULL,
  operador_telefono VARCHAR(20) DEFAULT NULL,
  operador_email VARCHAR(120) DEFAULT NULL,
  operador_web VARCHAR(255) DEFAULT NULL,
  accesible TINYINT(1) NOT NULL DEFAULT 0
);

-- Agregar campos faltantes a rutas también
ALTER TABLE rutas ADD COLUMN (
  descripcion TEXT DEFAULT NULL,
  historia TEXT DEFAULT NULL,
  duracion_horas DECIMAL(5,2) DEFAULT NULL,
  desnivel_positivo SMALLINT DEFAULT NULL,
  desnivel_negativo SMALLINT DEFAULT NULL,
  altitud_min SMALLINT DEFAULT NULL,
  altitud_max SMALLINT DEFAULT NULL,
  url_mapa VARCHAR(500) DEFAULT NULL,
  url_gpx VARCHAR(500) DEFAULT NULL,
  url_kml VARCHAR(500) DEFAULT NULL,
  mejor_epoca VARCHAR(255) DEFAULT NULL,
  recomendaciones TEXT DEFAULT NULL,
  equipo_sugerido TEXT DEFAULT NULL,
  incluye TEXT DEFAULT NULL,
  no_incluye TEXT DEFAULT NULL,
  precio_desde DECIMAL(10,2) DEFAULT NULL,
  precio_hasta DECIMAL(10,2) DEFAULT NULL,
  accesible TINYINT(1) NOT NULL DEFAULT 0
);

-- Agregar campos para atractivos
ALTER TABLE atractivos ADD COLUMN (
  altitud_msnm SMALLINT DEFAULT NULL COMMENT 'Altitud en metros sobre el nivel del mar',
  historia TEXT DEFAULT NULL COMMENT 'Historia / Reseña',
  telefono VARCHAR(20) DEFAULT NULL,
  email VARCHAR(120) DEFAULT NULL,
  sitio_web VARCHAR(255) DEFAULT NULL,
  accesible_movilidad TINYINT(1) NOT NULL DEFAULT 0,
  accesible_visual TINYINT(1) NOT NULL DEFAULT 0,
  accesible_auditiva TINYINT(1) NOT NULL DEFAULT 0,
  accesible_cognitiva TINYINT(1) NOT NULL DEFAULT 0,
  senaletica TINYINT(1) NOT NULL DEFAULT 0,
  baterias_sanitarias TINYINT(1) NOT NULL DEFAULT 0,
  estacionamiento TINYINT(1) NOT NULL DEFAULT 0
);
