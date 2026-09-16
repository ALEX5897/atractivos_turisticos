-- ============================================================
-- MIGRACIÓN 09 v2: Reestructurar tabla experiencias
-- Agregar solo campos que no existen
-- ============================================================

USE atractivos_turisticos;

-- Agregar campos faltantes (ignorando los que ya existen)
ALTER TABLE experiencias
ADD COLUMN codigo_experiencia_qt VARCHAR(32) DEFAULT NULL COMMENT 'Código QT de la experiencia' AFTER codigo;

ALTER TABLE experiencias
ADD COLUMN parroquia VARCHAR(120) DEFAULT NULL AFTER codigo_experiencia_qt;

ALTER TABLE experiencias
ADD COLUMN nodo VARCHAR(100) DEFAULT NULL AFTER parroquia;

ALTER TABLE experiencias
ADD COLUMN centralidad VARCHAR(100) DEFAULT NULL AFTER nodo;

ALTER TABLE experiencias
ADD COLUMN modalidad VARCHAR(100) DEFAULT NULL COMMENT 'Tipo de modalidad' AFTER centralidad;

ALTER TABLE experiencias
ADD COLUMN nombre_de_la_experiencia VARCHAR(200) DEFAULT NULL AFTER modalidad;

ALTER TABLE experiencias
ADD COLUMN breve_descripcion_y_actividades_a_realizar TEXT DEFAULT NULL AFTER nombre_de_la_experiencia;

ALTER TABLE experiencias
ADD COLUMN direccion VARCHAR(255) DEFAULT NULL AFTER breve_descripcion_y_actividades_a_realizar;

ALTER TABLE experiencias
ADD COLUMN tiempo_de_duracion DECIMAL(5,2) DEFAULT NULL AFTER longitud;

ALTER TABLE experiencias
ADD COLUMN horario_de_atencion VARCHAR(255) DEFAULT NULL AFTER tiempo_de_duracion;

ALTER TABLE experiencias
ADD COLUMN costo VARCHAR(255) DEFAULT NULL AFTER horario_de_atencion;

ALTER TABLE experiencias
ADD COLUMN capacidad SMALLINT UNSIGNED DEFAULT NULL AFTER costo;

ALTER TABLE experiencias
ADD COLUMN restricciones TEXT DEFAULT NULL AFTER capacidad;

ALTER TABLE experiencias
ADD COLUMN contactos VARCHAR(255) DEFAULT NULL AFTER restricciones;

ALTER TABLE experiencias
ADD COLUMN estado_experiencia ENUM('ACTIVO','INACTIVO','EN_REVISION','ELIMINADO') DEFAULT 'EN_REVISION' AFTER estado;

-- Crear índice para campos de búsqueda y filtrado
ALTER TABLE experiencias ADD INDEX idx_exp_estado_experiencia (estado_experiencia);
ALTER TABLE experiencias ADD INDEX idx_exp_centralidad (centralidad);
ALTER TABLE experiencias ADD INDEX idx_exp_nodo (nodo);

-- Migrar datos si existen
UPDATE experiencias SET nombre_de_la_experiencia = nombre WHERE nombre_de_la_experiencia IS NULL AND nombre IS NOT NULL;
UPDATE experiencias SET breve_descripcion_y_actividades_a_realizar = descripcion WHERE breve_descripcion_y_actividades_a_realizar IS NULL AND descripcion IS NOT NULL;
UPDATE experiencias SET tiempo_de_duracion = duracion_horas WHERE tiempo_de_duracion IS NULL AND duracion_horas IS NOT NULL;
UPDATE experiencias SET horario_de_atencion = horario WHERE horario_de_atencion IS NULL AND horario IS NOT NULL;

-- Registrar fin de migración
SELECT 'Migración 09 v2 completada: tabla experiencias reestructurada' AS mensaje;
