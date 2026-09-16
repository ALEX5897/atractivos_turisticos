-- Script para agregar padding a códigos numéricos 1-9 en todas las tablas de catálogos
-- Ejecutar después de confirmar que el cambio de padCode() está activo

-- Actualizar cat_nodos
UPDATE cat_nodos
SET cod_nodo = CONCAT('0', cod_nodo)
WHERE cod_nodo REGEXP '^[1-9]$';

-- Actualizar cat_centralidades
UPDATE cat_centralidades
SET cod_centralidad = CONCAT('0', cod_centralidad)
WHERE cod_centralidad REGEXP '^[1-9]$';

-- Actualizar cat_tipos
UPDATE cat_tipos
SET cod_tipo = CONCAT('0', cod_tipo)
WHERE cod_tipo REGEXP '^[1-9]$';

-- Actualizar cat_subtipos
UPDATE cat_subtipos
SET cod_subtipo = CONCAT('0', cod_subtipo)
WHERE cod_subtipo REGEXP '^[1-9]$';

-- Actualizar cat_dpa (parroquias)
UPDATE cat_dpa
SET cod_dpa = CONCAT('0', cod_dpa)
WHERE cod_dpa REGEXP '^[1-9]$';

-- Actualizar cat_categorias
UPDATE cat_categorias
SET cod_categoria = CONCAT('0', cod_categoria)
WHERE cod_categoria REGEXP '^[1-9]$';

-- Actualizar cat_modalidades
UPDATE cat_modalidades
SET cod_modalidad = CONCAT('0', cod_modalidad)
WHERE cod_modalidad REGEXP '^[1-9]$';

-- Verificar resultados
SELECT 'cat_nodos' as tabla, cod_nodo as codigo, COUNT(*) as cantidad FROM cat_nodos WHERE cod_nodo IS NOT NULL GROUP BY cod_nodo
UNION ALL
SELECT 'cat_centralidades', cod_centralidad, COUNT(*) FROM cat_centralidades WHERE cod_centralidad IS NOT NULL GROUP BY cod_centralidad
UNION ALL
SELECT 'cat_tipos', cod_tipo, COUNT(*) FROM cat_tipos WHERE cod_tipo IS NOT NULL GROUP BY cod_tipo
UNION ALL
SELECT 'cat_subtipos', cod_subtipo, COUNT(*) FROM cat_subtipos WHERE cod_subtipo IS NOT NULL GROUP BY cod_subtipo;
