-- ============================================================
-- MIGRACIÓN: Agregar campos de códigos QT y MINTUR a atractivos
-- Fecha: 2026-05-11
-- Descripción: Añade columnas para almacenar el código QT y el código MINTUR completos
-- ============================================================

USE atractivos_turisticos;

ALTER TABLE atractivos
  ADD COLUMN codigo_mintur VARCHAR(32) DEFAULT NULL COMMENT 'Código MINTUR completo' AFTER codigo,
  ADD COLUMN codigo_qt VARCHAR(32) DEFAULT NULL COMMENT 'Código QT completo' AFTER codigo_mintur,
  ADD INDEX idx_atractivo_codigo_mintur (codigo_mintur),
  ADD INDEX idx_atractivo_codigo_qt (codigo_qt);
