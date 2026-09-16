-- ============================================================
-- MIGRACIÓN 10: Agregar campos de auditoría a experiencias
-- ============================================================

USE atractivos_turisticos;

-- Agregar campos de auditoría si no existen
ALTER TABLE experiencias
ADD COLUMN creado_por VARCHAR(100) DEFAULT NULL COMMENT 'Usuario que creó el registro';

ALTER TABLE experiencias
ADD COLUMN actualizado_por VARCHAR(100) DEFAULT NULL COMMENT 'Usuario que actualizó el registro';

-- Crear índices
ALTER TABLE experiencias ADD INDEX idx_exp_creado_por (creado_por);
ALTER TABLE experiencias ADD INDEX idx_exp_actualizado_por (actualizado_por);

SELECT 'Migración 10 completada: campos de auditoría agregados' AS mensaje;
