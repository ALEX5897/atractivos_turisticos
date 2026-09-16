-- Permitir NULL en campos que ahora son opcionales
ALTER TABLE atractivos MODIFY COLUMN id_categoria TINYINT UNSIGNED DEFAULT NULL;
ALTER TABLE atractivos MODIFY COLUMN id_tipo SMALLINT UNSIGNED DEFAULT NULL;
