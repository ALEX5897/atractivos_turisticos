-- ============================================================
-- Migración 13: Agregar campo iniciales_nombre a rutas
-- ============================================================

USE atractivos_turisticos;

-- Agregar el campo iniciales_nombre si no existe
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS iniciales_nombre VARCHAR(10) NULL AFTER nombre;

SELECT 'Migración 13 completada - Campo iniciales_nombre agregado a rutas';
