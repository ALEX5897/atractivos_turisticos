-- Agregar campos faltantes a tabla atractivos

ALTER TABLE atractivos
ADD COLUMN nombre_alternativo VARCHAR(200) NULL AFTER nombre,
ADD COLUMN barrio VARCHAR(100) NULL AFTER id_parroquia,
ADD COLUMN referencia TEXT NULL AFTER direccion,
ADD COLUMN descripcion LONGTEXT NULL AFTER longitud,
ADD COLUMN importancia TEXT NULL AFTER historia,
ADD COLUMN telefono_alt VARCHAR(20) NULL AFTER telefono,
ADD COLUMN precio_entrada VARCHAR(50) NULL DEFAULT 'GRATUITO' AFTER horario,
ADD COLUMN precio_detalle TEXT NULL AFTER precio_entrada,
ADD COLUMN accesibilidad_notas TEXT NULL AFTER accesible_cognitiva,
ADD COLUMN fecha_levantamiento DATE NULL AFTER estado,
ADD COLUMN observaciones TEXT NULL AFTER fecha_levantamiento,
ADD COLUMN creado_por VARCHAR(100) NULL AFTER observaciones;
