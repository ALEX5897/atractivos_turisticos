-- ============================================================
-- MIGRACIÓN: Agregar campos de códigos individuales
-- Fecha: 2026-05-20
-- Descripción: Añade columnas para almacenar los códigos individuales (DPA, Categoría, Nodo, etc.)
-- ============================================================

USE atractivos_turisticos;

ALTER TABLE atractivos
  ADD COLUMN cod_dpa VARCHAR(20) NULL COMMENT 'Código DPA' AFTER codigo_qt,
  ADD COLUMN cod_categoria VARCHAR(10) NULL COMMENT 'Código Categoría' AFTER cod_dpa,
  ADD COLUMN cod_nodo VARCHAR(10) NULL COMMENT 'Código Nodo' AFTER cod_categoria,
  ADD COLUMN cod_centralidad VARCHAR(10) NULL COMMENT 'Código Centralidad' AFTER cod_nodo,
  ADD COLUMN cod_subcentralidad VARCHAR(10) NULL COMMENT 'Código Subcentralidad' AFTER cod_centralidad,
  ADD COLUMN cod_tipo VARCHAR(10) NULL COMMENT 'Código Tipo' AFTER cod_subcentralidad,
  ADD COLUMN cod_subtipo VARCHAR(10) NULL COMMENT 'Código Subtipo' AFTER cod_tipo;
