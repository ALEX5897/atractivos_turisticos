-- ============================================================
-- ============================================================
-- MIGRACIÓN: Agregar campo 'orden' (número secuencial) a tablas principales
-- Fecha: 2026-05-08
-- Descripción: Agrega campo 'orden' como número secuencial auto-incremental único
--              a las tablas atractivos, experiencias y rutas
-- ============================================================

USE atractivos_turisticos;

-- Tabla: atractivos
-- Verificar e insertar el campo si no existe
ALTER TABLE atractivos
ADD COLUMN orden INT UNSIGNED UNIQUE DEFAULT NULL AFTER id_atractivo;

-- Tabla: experiencias
ALTER TABLE experiencias
ADD COLUMN orden INT UNSIGNED UNIQUE DEFAULT NULL AFTER id_experiencia;

-- Tabla: rutas
ALTER TABLE rutas
ADD COLUMN orden INT UNSIGNED UNIQUE DEFAULT NULL AFTER id_ruta;

-- ============================================================
-- Notas importantes:
-- 1. El campo 'orden' es UNIQUE para garantizar que cada registro tenga un número único
-- 2. El valor puede completarse con números secuenciales desde la aplicación o una migración
-- 3. Este número es INMUTABLE y no depende de la paginación
-- ============================================================
