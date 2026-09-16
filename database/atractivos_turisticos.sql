-- ============================================================
-- BASE DE DATOS: atractivos_turisticos
-- Sistema de Gestión de Atractivos Turísticos - Quito Turismo
-- Versión: 1.0.0 | Fecha: 2026-04-23
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET TIME_ZONE = '-05:00';

-- ------------------------------------------------------------
-- CREAR Y SELECCIONAR BASE DE DATOS
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS atractivos_turisticos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE atractivos_turisticos;


-- ============================================================
-- TABLAS CATALOGO / MAESTRAS
-- ============================================================

-- Categorías de atractivos (Naturales / Culturales)
CREATE TABLE IF NOT EXISTS cat_categorias (
  id_categoria   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(80)  NOT NULL,
  descripcion    VARCHAR(255) DEFAULT NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  UNIQUE KEY uq_cat_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipos / subcategorías de atractivos
CREATE TABLE IF NOT EXISTS cat_tipos (
  id_tipo        SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_categoria   TINYINT UNSIGNED NOT NULL,
  nombre         VARCHAR(100) NOT NULL,
  codigo         VARCHAR(10)  DEFAULT NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  UNIQUE KEY uq_tipo_nombre (id_categoria, nombre),
  CONSTRAINT fk_tipo_categoria FOREIGN KEY (id_categoria)
    REFERENCES cat_categorias (id_categoria) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parroquias del Distrito Metropolitano de Quito
CREATE TABLE IF NOT EXISTS cat_parroquias (
  id_parroquia   SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(80)  NOT NULL,
  zona           ENUM('NORTE','CENTRO','SUR','VALLES','RURAL') NOT NULL,
  tipo           ENUM('URBANA','RURAL') NOT NULL DEFAULT 'URBANA',
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  UNIQUE KEY uq_parroquia_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Administraciones zonales del DMQ
CREATE TABLE IF NOT EXISTS cat_administraciones_zonales (
  id_adm_zonal   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  UNIQUE KEY uq_adm_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipo de propietario / tenencia
CREATE TABLE IF NOT EXISTS cat_tipos_propietario (
  id_tipo_prop   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(80)  NOT NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipos de experiencia turística
CREATE TABLE IF NOT EXISTS cat_tipos_experiencia (
  id_tipo_exp    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  descripcion    VARCHAR(255) DEFAULT NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  UNIQUE KEY uq_tipo_exp_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tipos de ruta turística
CREATE TABLE IF NOT EXISTS cat_tipos_ruta (
  id_tipo_ruta   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  descripcion    VARCHAR(255) DEFAULT NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  UNIQUE KEY uq_tipo_ruta_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Idiomas disponibles en atractivos / experiencias
CREATE TABLE IF NOT EXISTS cat_idiomas (
  id_idioma      TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo         CHAR(5)     NOT NULL,
  nombre         VARCHAR(60) NOT NULL,
  activo         TINYINT(1)  NOT NULL DEFAULT 1,
  UNIQUE KEY uq_idioma_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Servicios básicos y complementarios disponibles
CREATE TABLE IF NOT EXISTS cat_servicios (
  id_servicio    SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  grupo          VARCHAR(60)  DEFAULT NULL,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  UNIQUE KEY uq_servicio_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- ATRACTIVOS TURÍSTICOS
-- ============================================================

CREATE TABLE IF NOT EXISTS atractivos (
  id_atractivo        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  orden               INT UNSIGNED UNIQUE DEFAULT NULL,

  -- Identificación
  codigo              VARCHAR(20)  NOT NULL COMMENT 'Código único MINTUR',
  codigo_mintur       VARCHAR(32) DEFAULT NULL COMMENT 'Código MINTUR completo',
  codigo_qt           VARCHAR(32) DEFAULT NULL COMMENT 'Código QT completo',
  nombre              VARCHAR(200) NOT NULL,
  nombre_alternativo  VARCHAR(200) DEFAULT NULL,

  -- Clasificación
  id_categoria        TINYINT UNSIGNED NOT NULL,
  id_tipo             SMALLINT UNSIGNED NOT NULL,
  jerarquia           TINYINT UNSIGNED NOT NULL DEFAULT 0
                        COMMENT '0=Sin jerarquía, 1-4 según MINTUR',

  -- Ubicación
  id_parroquia        SMALLINT UNSIGNED DEFAULT NULL,
  id_adm_zonal        TINYINT UNSIGNED DEFAULT NULL,
  barrio              VARCHAR(120) DEFAULT NULL,
  direccion           VARCHAR(255) DEFAULT NULL,
  referencia          VARCHAR(255) DEFAULT NULL,
  latitud             DECIMAL(10,7) DEFAULT NULL,
  longitud            DECIMAL(10,7) DEFAULT NULL,
  altitud_msnm        SMALLINT DEFAULT NULL,

  -- Descripción
  descripcion         TEXT DEFAULT NULL,
  historia            TEXT DEFAULT NULL,
  importancia         TEXT DEFAULT NULL,

  -- Contacto
  telefono            VARCHAR(20)  DEFAULT NULL,
  telefono_alt        VARCHAR(20)  DEFAULT NULL,
  email               VARCHAR(120) DEFAULT NULL,
  sitio_web           VARCHAR(255) DEFAULT NULL,
  facebook            VARCHAR(255) DEFAULT NULL,
  instagram           VARCHAR(255) DEFAULT NULL,

  -- Operación
  horario             VARCHAR(255) DEFAULT NULL,
  precio_entrada      ENUM('GRATUITO','PAGADO','MIXTO') DEFAULT 'GRATUITO',
  precio_detalle      VARCHAR(255) DEFAULT NULL,
  aforo_max           SMALLINT UNSIGNED DEFAULT NULL,

  -- Propietario / Administración
  id_tipo_propietario TINYINT UNSIGNED DEFAULT NULL,
  propietario_nombre  VARCHAR(200) DEFAULT NULL,
  propietario_ruc     VARCHAR(13)  DEFAULT NULL,
  administrador       VARCHAR(200) DEFAULT NULL,

  -- Accesibilidad
  accesible_movilidad TINYINT(1)   NOT NULL DEFAULT 0,
  accesible_visual    TINYINT(1)   NOT NULL DEFAULT 0,
  accesible_auditiva  TINYINT(1)   NOT NULL DEFAULT 0,
  accesible_cognitiva TINYINT(1)   NOT NULL DEFAULT 0,
  accesibilidad_notas VARCHAR(500) DEFAULT NULL,

  -- Señalética y equipamiento
  senaletica          TINYINT(1)   NOT NULL DEFAULT 0,
  baterias_sanitarias TINYINT(1)   NOT NULL DEFAULT 0,
  estacionamiento     TINYINT(1)   NOT NULL DEFAULT 0,

  -- Clima
  clima               VARCHAR(60)  DEFAULT NULL,
  temperatura_min     DECIMAL(4,1) DEFAULT NULL,
  temperatura_max     DECIMAL(4,1) DEFAULT NULL,

  -- Estado / Gestión
  estado              ENUM('ACTIVO','INACTIVO','EN_REVISION','ELIMINADO')
                        NOT NULL DEFAULT 'EN_REVISION',
  fecha_levantamiento DATE         DEFAULT NULL,
  observaciones       TEXT         DEFAULT NULL,

  -- Auditoría
  creado_por          VARCHAR(100) DEFAULT NULL,
  actualizado_por     VARCHAR(100) DEFAULT NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_atractivo_codigo (codigo),
  KEY idx_atractivo_codigo_mintur (codigo_mintur),
  KEY idx_atractivo_codigo_qt (codigo_qt),
  KEY idx_atractivo_estado (estado),
  KEY idx_atractivo_categoria (id_categoria),
  KEY idx_atractivo_parroquia (id_parroquia),
  KEY idx_atractivo_jerarquia (jerarquia),

  CONSTRAINT fk_atractivo_categoria   FOREIGN KEY (id_categoria)
    REFERENCES cat_categorias (id_categoria) ON UPDATE CASCADE,
  CONSTRAINT fk_atractivo_tipo        FOREIGN KEY (id_tipo)
    REFERENCES cat_tipos (id_tipo) ON UPDATE CASCADE,
  CONSTRAINT fk_atractivo_parroquia   FOREIGN KEY (id_parroquia)
    REFERENCES cat_parroquias (id_parroquia) ON UPDATE CASCADE,
  CONSTRAINT fk_atractivo_adm_zonal   FOREIGN KEY (id_adm_zonal)
    REFERENCES cat_administraciones_zonales (id_adm_zonal) ON UPDATE CASCADE,
  CONSTRAINT fk_atractivo_tipo_prop   FOREIGN KEY (id_tipo_propietario)
    REFERENCES cat_tipos_propietario (id_tipo_prop) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Fotografías de atractivos
CREATE TABLE IF NOT EXISTS atractivos_fotos (
  id_foto          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_atractivo     INT UNSIGNED NOT NULL,
  ruta_archivo     VARCHAR(500) NOT NULL,
  nombre_original  VARCHAR(255) DEFAULT NULL,
  descripcion      VARCHAR(255) DEFAULT NULL,
  es_principal     TINYINT(1)   NOT NULL DEFAULT 0,
  orden            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_foto_atractivo (id_atractivo),
  CONSTRAINT fk_foto_atractivo FOREIGN KEY (id_atractivo)
    REFERENCES atractivos (id_atractivo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Servicios disponibles por atractivo (tabla pivote)
CREATE TABLE IF NOT EXISTS atractivos_servicios (
  id_atractivo   INT UNSIGNED      NOT NULL,
  id_servicio    SMALLINT UNSIGNED NOT NULL,
  notas          VARCHAR(255)      DEFAULT NULL,
  PRIMARY KEY (id_atractivo, id_servicio),
  CONSTRAINT fk_atrserv_atractivo FOREIGN KEY (id_atractivo)
    REFERENCES atractivos (id_atractivo) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_atrserv_servicio  FOREIGN KEY (id_servicio)
    REFERENCES cat_servicios (id_servicio) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Idiomas disponibles por atractivo (tabla pivote)
CREATE TABLE IF NOT EXISTS atractivos_idiomas (
  id_atractivo   INT UNSIGNED     NOT NULL,
  id_idioma      TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id_atractivo, id_idioma),
  CONSTRAINT fk_atridi_atractivo FOREIGN KEY (id_atractivo)
    REFERENCES atractivos (id_atractivo) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_atridi_idioma    FOREIGN KEY (id_idioma)
    REFERENCES cat_idiomas (id_idioma) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- EXPERIENCIAS TURÍSTICAS
-- ============================================================

CREATE TABLE IF NOT EXISTS experiencias (
  id_experiencia     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  orden              INT UNSIGNED UNIQUE DEFAULT NULL,

  -- Identificación
  codigo             VARCHAR(20)  NOT NULL COMMENT 'Código único de experiencia',
  nombre             VARCHAR(200) NOT NULL,

  -- Clasificación
  id_tipo_exp        TINYINT UNSIGNED NOT NULL,
  id_atractivo       INT UNSIGNED DEFAULT NULL COMMENT 'Atractivo principal asociado',

  -- Descripción
  descripcion        TEXT DEFAULT NULL,
  incluye            TEXT DEFAULT NULL,
  no_incluye         TEXT DEFAULT NULL,
  requisitos         TEXT DEFAULT NULL,

  -- Operación
  duracion_horas     DECIMAL(5,2) DEFAULT NULL,
  precio_desde       DECIMAL(10,2) DEFAULT NULL,
  precio_hasta       DECIMAL(10,2) DEFAULT NULL,
  moneda             CHAR(3)       NOT NULL DEFAULT 'USD',
  capacidad_min      TINYINT UNSIGNED DEFAULT 1,
  capacidad_max      SMALLINT UNSIGNED DEFAULT NULL,
  punto_encuentro    VARCHAR(255) DEFAULT NULL,
  horario            VARCHAR(255) DEFAULT NULL,
  disponibilidad     SET('LUNES','MARTES','MIERCOLES','JUEVES',
                         'VIERNES','SABADO','DOMINGO') DEFAULT NULL,

  -- Operador
  operador_nombre    VARCHAR(200) DEFAULT NULL,
  operador_ruc       VARCHAR(13)  DEFAULT NULL,
  operador_telefono  VARCHAR(20)  DEFAULT NULL,
  operador_email     VARCHAR(120) DEFAULT NULL,
  operador_web       VARCHAR(255) DEFAULT NULL,
  operador_licencia  VARCHAR(60)  DEFAULT NULL,

  -- Accesibilidad
  accesible          TINYINT(1)   NOT NULL DEFAULT 0,
  accesibilidad_notas VARCHAR(500) DEFAULT NULL,

  -- Estado
  estado             ENUM('ACTIVO','INACTIVO','EN_REVISION','ELIMINADO')
                       NOT NULL DEFAULT 'EN_REVISION',
  observaciones      TEXT DEFAULT NULL,

  -- Auditoría
  creado_por         VARCHAR(100) DEFAULT NULL,
  actualizado_por    VARCHAR(100) DEFAULT NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                       ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_experiencia_codigo (codigo),
  KEY idx_exp_estado (estado),
  KEY idx_exp_tipo (id_tipo_exp),
  KEY idx_exp_atractivo (id_atractivo),

  CONSTRAINT fk_exp_tipo_exp   FOREIGN KEY (id_tipo_exp)
    REFERENCES cat_tipos_experiencia (id_tipo_exp) ON UPDATE CASCADE,
  CONSTRAINT fk_exp_atractivo  FOREIGN KEY (id_atractivo)
    REFERENCES atractivos (id_atractivo) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Fotografías de experiencias
CREATE TABLE IF NOT EXISTS experiencias_fotos (
  id_foto          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_experiencia   INT UNSIGNED NOT NULL,
  ruta_archivo     VARCHAR(500) NOT NULL,
  nombre_original  VARCHAR(255) DEFAULT NULL,
  descripcion      VARCHAR(255) DEFAULT NULL,
  es_principal     TINYINT(1)   NOT NULL DEFAULT 0,
  orden            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_expfoto_exp (id_experiencia),
  CONSTRAINT fk_expfoto_experiencia FOREIGN KEY (id_experiencia)
    REFERENCES experiencias (id_experiencia) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Idiomas de las experiencias (tabla pivote)
CREATE TABLE IF NOT EXISTS experiencias_idiomas (
  id_experiencia  INT UNSIGNED     NOT NULL,
  id_idioma       TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id_experiencia, id_idioma),
  CONSTRAINT fk_expidi_exp    FOREIGN KEY (id_experiencia)
    REFERENCES experiencias (id_experiencia) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_expidi_idioma FOREIGN KEY (id_idioma)
    REFERENCES cat_idiomas (id_idioma) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- RUTAS TURÍSTICAS
-- ============================================================

CREATE TABLE IF NOT EXISTS rutas (
  id_ruta            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  orden              INT UNSIGNED UNIQUE DEFAULT NULL,

  -- Identificación
  codigo             VARCHAR(20)  NOT NULL COMMENT 'Código único de ruta',
  nombre             VARCHAR(200) NOT NULL,
  nombre_alternativo VARCHAR(200) DEFAULT NULL,

  -- Clasificación
  id_tipo_ruta       TINYINT UNSIGNED NOT NULL,

  -- Descripción
  descripcion        TEXT DEFAULT NULL,
  historia           TEXT DEFAULT NULL,

  -- Características
  dificultad         ENUM('FACIL','MODERADO','DIFICIL','MUY_DIFICIL')
                       DEFAULT 'FACIL',
  duracion_horas     DECIMAL(5,2) DEFAULT NULL,
  distancia_km       DECIMAL(7,2) DEFAULT NULL,
  desnivel_positivo  SMALLINT DEFAULT NULL COMMENT 'metros',
  desnivel_negativo  SMALLINT DEFAULT NULL COMMENT 'metros',
  altitud_min        SMALLINT DEFAULT NULL COMMENT 'msnm',
  altitud_max        SMALLINT DEFAULT NULL COMMENT 'msnm',

  -- Puntos de inicio / fin
  punto_inicio_nombre  VARCHAR(200) DEFAULT NULL,
  punto_inicio_lat     DECIMAL(10,7) DEFAULT NULL,
  punto_inicio_lng     DECIMAL(10,7) DEFAULT NULL,
  punto_fin_nombre     VARCHAR(200)  DEFAULT NULL,
  punto_fin_lat        DECIMAL(10,7) DEFAULT NULL,
  punto_fin_lng        DECIMAL(10,7) DEFAULT NULL,

  -- Recursos cartográficos
  url_mapa           VARCHAR(500) DEFAULT NULL,
  url_gpx            VARCHAR(500) DEFAULT NULL,
  url_kml            VARCHAR(500) DEFAULT NULL,

  -- Recomendaciones
  mejor_epoca        VARCHAR(255) DEFAULT NULL,
  recomendaciones    TEXT         DEFAULT NULL,
  equipo_sugerido    TEXT         DEFAULT NULL,
  incluye            TEXT         DEFAULT NULL,
  no_incluye         TEXT         DEFAULT NULL,

  -- Operación
  precio_desde       DECIMAL(10,2) DEFAULT NULL,
  precio_hasta       DECIMAL(10,2) DEFAULT NULL,
  moneda             CHAR(3)       NOT NULL DEFAULT 'USD',

  -- Accesibilidad
  accesible          TINYINT(1)   NOT NULL DEFAULT 0,
  accesibilidad_notas VARCHAR(500) DEFAULT NULL,

  -- Estado
  estado             ENUM('ACTIVO','INACTIVO','EN_REVISION','ELIMINADO')
                       NOT NULL DEFAULT 'EN_REVISION',
  observaciones      TEXT DEFAULT NULL,

  -- Auditoría
  creado_por         VARCHAR(100) DEFAULT NULL,
  actualizado_por    VARCHAR(100) DEFAULT NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                       ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_ruta_codigo (codigo),
  KEY idx_ruta_estado (estado),
  KEY idx_ruta_tipo (id_tipo_ruta),
  KEY idx_ruta_dificultad (dificultad),

  CONSTRAINT fk_ruta_tipo FOREIGN KEY (id_tipo_ruta)
    REFERENCES cat_tipos_ruta (id_tipo_ruta) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Atractivos que componen cada ruta (tabla pivote con orden)
CREATE TABLE IF NOT EXISTS rutas_atractivos (
  id_ruta          INT UNSIGNED NOT NULL,
  id_atractivo     INT UNSIGNED NOT NULL,
  orden            TINYINT UNSIGNED NOT NULL DEFAULT 0,
  es_principal     TINYINT(1)   NOT NULL DEFAULT 0,
  notas            VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (id_ruta, id_atractivo),
  KEY idx_rutaatr_atractivo (id_atractivo),
  CONSTRAINT fk_rutaatr_ruta      FOREIGN KEY (id_ruta)
    REFERENCES rutas (id_ruta) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rutaatr_atractivo FOREIGN KEY (id_atractivo)
    REFERENCES atractivos (id_atractivo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Fotografías de rutas
CREATE TABLE IF NOT EXISTS rutas_fotos (
  id_foto        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ruta        INT UNSIGNED NOT NULL,
  ruta_archivo   VARCHAR(500) NOT NULL,
  nombre_original VARCHAR(255) DEFAULT NULL,
  descripcion    VARCHAR(255) DEFAULT NULL,
  es_principal   TINYINT(1)   NOT NULL DEFAULT 0,
  orden          TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_rutafoto_ruta (id_ruta),
  CONSTRAINT fk_rutafoto_ruta FOREIGN KEY (id_ruta)
    REFERENCES rutas (id_ruta) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Experiencias disponibles en cada ruta (tabla pivote)
CREATE TABLE IF NOT EXISTS rutas_experiencias (
  id_ruta          INT UNSIGNED NOT NULL,
  id_experiencia   INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_ruta, id_experiencia),
  CONSTRAINT fk_rutaexp_ruta FOREIGN KEY (id_ruta)
    REFERENCES rutas (id_ruta) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rutaexp_exp  FOREIGN KEY (id_experiencia)
    REFERENCES experiencias (id_experiencia) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- AUDITORÍA / LOGS DE CAMBIOS
-- ============================================================

CREATE TABLE IF NOT EXISTS auditoria (
  id_auditoria   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tabla          VARCHAR(60)   NOT NULL,
  id_registro    INT UNSIGNED  NOT NULL,
  accion         ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  datos_antes    JSON          DEFAULT NULL,
  datos_despues  JSON          DEFAULT NULL,
  usuario        VARCHAR(100)  DEFAULT NULL,
  ip             VARCHAR(45)   DEFAULT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_auditoria_tabla (tabla, id_registro),
  KEY idx_auditoria_usuario (usuario),
  KEY idx_auditoria_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- DATOS INICIALES DE CATÁLOGOS
-- ============================================================

-- Categorías (MINTUR Ecuador)
INSERT INTO cat_categorias (nombre, descripcion) VALUES
  ('Atractivos Naturales', 'Sitios y manifestaciones de la naturaleza'),
  ('Manifestaciones Culturales', 'Expresiones de la cultura tangible e intangible');

-- Tipos - Naturales
INSERT INTO cat_tipos (id_categoria, nombre, codigo) VALUES
  (1, 'Montañas',              'NAT-01'),
  (1, 'Ambientes Lacustres',   'NAT-02'),
  (1, 'Ríos',                  'NAT-03'),
  (1, 'Bosques',               'NAT-04'),
  (1, 'Aguas Subterráneas',    'NAT-05'),
  (1, 'Fenómenos Especiales',  'NAT-06'),
  (1, 'Costas o Litorales',    'NAT-07'),
  (1, 'Ambientes Marinos',     'NAT-08'),
  (1, 'Tierras Insulares',     'NAT-09'),
  (1, 'Sistema de Áreas Protegidas', 'NAT-10');

-- Tipos - Culturales
INSERT INTO cat_tipos (id_categoria, nombre, codigo) VALUES
  (2, 'Históricas',                     'CUL-01'),
  (2, 'Museos y Centros Culturales',    'CUL-02'),
  (2, 'Arquitectura y Espacios Urbanos','CUL-03'),
  (2, 'Zonas Históricas',               'CUL-04'),
  (2, 'Realizaciones Técnicas y Científicas', 'CUL-05'),
  (2, 'Realizaciones Artísticas Contemporáneas', 'CUL-06'),
  (2, 'Eventos Programados',            'CUL-07'),
  (2, 'Etnografía',                     'CUL-08'),
  (2, 'Realizaciones Deportivas y Recreativas', 'CUL-09'),
  (2, 'Gastronomía',                    'CUL-10');

-- Parroquias del DMQ (muestra representativa)
INSERT INTO cat_parroquias (nombre, zona, tipo) VALUES
  ('Belisario Quevedo',  'NORTE',  'URBANA'),
  ('Carcelén',           'NORTE',  'URBANA'),
  ('Cochapamba',         'NORTE',  'URBANA'),
  ('Comité del Pueblo',  'NORTE',  'URBANA'),
  ('El Condado',         'NORTE',  'URBANA'),
  ('Cotocollao',         'NORTE',  'URBANA'),
  ('Ponceano',           'NORTE',  'URBANA'),
  ('San Isidro del Inca','NORTE',  'URBANA'),
  ('Zámbiza',            'NORTE',  'RURAL'),
  ('Centro Histórico',   'CENTRO', 'URBANA'),
  ('Itchimbía',          'CENTRO', 'URBANA'),
  ('Puengasí',           'CENTRO', 'URBANA'),
  ('San Juan',           'CENTRO', 'URBANA'),
  ('La Libertad',        'CENTRO', 'URBANA'),
  ('Chilibulo',          'SUR',    'URBANA'),
  ('Chillogallo',        'SUR',    'URBANA'),
  ('Guamaní',            'SUR',    'URBANA'),
  ('La Argelia',         'SUR',    'URBANA'),
  ('La Ecuatoriana',     'SUR',    'URBANA'),
  ('La Ferroviaria',     'SUR',    'URBANA'),
  ('La Magdalena',       'SUR',    'URBANA'),
  ('La Mena',            'SUR',    'URBANA'),
  ('Quitumbe',           'SUR',    'URBANA'),
  ('Solanda',            'SUR',    'URBANA'),
  ('Turubamba',          'SUR',    'URBANA'),
  ('Cumbayá',            'VALLES', 'URBANA'),
  ('Tumbaco',            'VALLES', 'URBANA'),
  ('Conocoto',           'VALLES', 'URBANA'),
  ('Amaguaña',           'VALLES', 'RURAL'),
  ('Calderón',           'NORTE',  'URBANA');

-- Administraciones Zonales del DMQ
INSERT INTO cat_administraciones_zonales (nombre) VALUES
  ('Administración Zonal La Delicia'),
  ('Administración Zonal Eugenio Espejo'),
  ('Administración Zonal Manuela Sáenz'),
  ('Administración Zonal Eloy Alfaro'),
  ('Administración Zonal Quitumbe'),
  ('Administración Zonal Tumbaco'),
  ('Administración Zonal Los Chillos'),
  ('Administración Zonal Calderón');

-- Tipos de propietario
INSERT INTO cat_tipos_propietario (nombre) VALUES
  ('Público - Estado'),
  ('Público - Municipal'),
  ('Privado'),
  ('Comunitario'),
  ('Mixto');

-- Tipos de experiencia
INSERT INTO cat_tipos_experiencia (nombre) VALUES
  ('Turismo Cultural'),
  ('Turismo de Naturaleza y Aventura'),
  ('Turismo Gastronómico'),
  ('Turismo Religioso y Espiritual'),
  ('Turismo de Bienestar'),
  ('Turismo Educativo'),
  ('Turismo de Fotografía'),
  ('Turismo Nocturno'),
  ('Turismo Comunitario'),
  ('Turismo Deportivo');

-- Tipos de ruta
INSERT INTO cat_tipos_ruta (nombre) VALUES
  ('Ruta Cultural'),
  ('Ruta de Naturaleza'),
  ('Ruta Gastronómica'),
  ('Ruta de Aventura'),
  ('Ruta Religiosa'),
  ('Ruta de Compras y Artesanías'),
  ('Ruta Temática'),
  ('Ruta Accesible');

-- Idiomas
INSERT INTO cat_idiomas (codigo, nombre) VALUES
  ('es',    'Español'),
  ('en',    'Inglés'),
  ('fr',    'Francés'),
  ('de',    'Alemán'),
  ('pt',    'Portugués'),
  ('it',    'Italiano'),
  ('zh-CN', 'Chino Mandarín'),
  ('ja',    'Japonés'),
  ('qu',    'Quichua');

-- Servicios básicos y complementarios
INSERT INTO cat_servicios (nombre, grupo) VALUES
  ('Baterías sanitarias',          'Básicos'),
  ('Agua potable',                 'Básicos'),
  ('Estacionamiento gratuito',     'Básicos'),
  ('Estacionamiento pagado',       'Básicos'),
  ('Señalética interpretativa',    'Básicos'),
  ('Guía turístico',               'Complementarios'),
  ('Audioguía',                    'Complementarios'),
  ('Tienda de souvenirs',          'Complementarios'),
  ('Cafetería / Restaurant',       'Alimentación'),
  ('Área de picnic',               'Recreación'),
  ('Zona Wi-Fi',                   'Tecnología'),
  ('Acceso para personas con movilidad reducida', 'Accesibilidad'),
  ('Silla de ruedas disponible',   'Accesibilidad'),
  ('Material en Braille',          'Accesibilidad'),
  ('Servicio de transporte',       'Transporte'),
  ('Primeros auxilios',            'Seguridad'),
  ('Lockers / Guardaequipaje',     'Seguridad');

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
