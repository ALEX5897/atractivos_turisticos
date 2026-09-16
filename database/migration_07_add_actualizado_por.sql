-- Agregar campos de auditoría a tabla atractivos

ALTER TABLE atractivos
ADD COLUMN actualizado_por VARCHAR(100) NULL AFTER creado_por;
