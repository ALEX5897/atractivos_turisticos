-- ============================================================
-- SCRIPT DE LIMPIEZA DE DATOS
-- Elimina todos los datos excepto catálogos
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas de Rutas
DELETE FROM rutas_experiencias;
DELETE FROM rutas_atractivos;
DELETE FROM rutas_fotos;
DELETE FROM rutas;

-- Limpiar tablas de Experiencias
DELETE FROM experiencias_idiomas;
DELETE FROM experiencias_fotos;
DELETE FROM experiencias;

-- Limpiar tablas de Atractivos
DELETE FROM atractivos_idiomas;
DELETE FROM atractivos_servicios;
DELETE FROM atractivos_fotos;
DELETE FROM atractivos;

-- Limpiar tabla de Auditoría
DELETE FROM auditoria;

-- Resetear auto_increment para que los IDs comiencen desde 1
ALTER TABLE atractivos AUTO_INCREMENT = 1;
ALTER TABLE atractivos_fotos AUTO_INCREMENT = 1;
ALTER TABLE experiencias AUTO_INCREMENT = 1;
ALTER TABLE experiencias_fotos AUTO_INCREMENT = 1;
ALTER TABLE rutas AUTO_INCREMENT = 1;
ALTER TABLE rutas_fotos AUTO_INCREMENT = 1;
ALTER TABLE auditoria AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- CONFIRMACIÓN
-- ============================================================
-- Base de datos limpiada exitosamente
-- Catálogos preservados:
-- ✓ cat_categorias
-- ✓ cat_tipos
-- ✓ cat_parroquias
-- ✓ cat_administraciones_zonales
-- ✓ cat_tipos_propietario
-- ✓ cat_tipos_experiencia
-- ✓ cat_tipos_ruta
-- ✓ cat_idiomas
-- ✓ cat_servicios
-- ============================================================
