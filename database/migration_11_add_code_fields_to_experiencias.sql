-- ============================================================
-- MIGRACIÓN 11: Agregar campos de código individual a experiencias
-- ============================================================

USE atractivos_turisticos;

-- Agregar campos para almacenar códigos individuales
ALTER TABLE experiencias
ADD COLUMN cod_parroquia VARCHAR(100) DEFAULT NULL COMMENT 'Código de parroquia' AFTER parroquia;

ALTER TABLE experiencias
ADD COLUMN cod_modalidad VARCHAR(100) DEFAULT NULL COMMENT 'Código de modalidad' AFTER modalidad;

ALTER TABLE experiencias
ADD COLUMN cod_nodo VARCHAR(100) DEFAULT NULL COMMENT 'Código de nodo' AFTER nodo;

ALTER TABLE experiencias
ADD COLUMN cod_centralidad VARCHAR(100) DEFAULT NULL COMMENT 'Código de centralidad' AFTER centralidad;

-- Crear índices para búsqueda
ALTER TABLE experiencias ADD INDEX idx_exp_cod_parroquia (cod_parroquia);
ALTER TABLE experiencias ADD INDEX idx_exp_cod_modalidad (cod_modalidad);
ALTER TABLE experiencias ADD INDEX idx_exp_cod_nodo (cod_nodo);
ALTER TABLE experiencias ADD INDEX idx_exp_cod_centralidad (cod_centralidad);

SELECT 'Migración 11 completada: campos de código agregados a experiencias' AS mensaje;
