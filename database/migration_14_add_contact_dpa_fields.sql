-- Migration 14: Agregar campos de contacto y DPA a tabla rutas
-- Fecha: 2026-05-23
-- Descripción: Agrega campos para teléfono, correo electrónico y ubicación DPA

USE atractivos_turisticos;

ALTER TABLE rutas
ADD COLUMN contacto_telefono VARCHAR(20) DEFAULT NULL COMMENT 'Teléfono de contacto' AFTER establecimiento_a_b,
ADD COLUMN contacto_correo_electronico VARCHAR(100) DEFAULT NULL COMMENT 'Correo electrónico de contacto' AFTER contacto_telefono,
ADD COLUMN dpa_manzana_localidad_atractivo VARCHAR(255) DEFAULT NULL COMMENT 'DPA - Manzana/Localidad del atractivo' AFTER contacto_correo_electronico;

-- Verificar que los campos fueron agregados
DESCRIBE rutas;
