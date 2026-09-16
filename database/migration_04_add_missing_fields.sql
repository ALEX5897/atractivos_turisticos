-- Agregar campos faltantes a tabla atractivos
ALTER TABLE atractivos ADD COLUMN parroquia VARCHAR(100) DEFAULT NULL AFTER id_parroquia;
ALTER TABLE atractivos ADD COLUMN nodo VARCHAR(100) DEFAULT NULL AFTER parroquia;
ALTER TABLE atractivos ADD COLUMN centralidad VARCHAR(100) DEFAULT NULL AFTER nodo;
ALTER TABLE atractivos ADD COLUMN subcentralidad VARCHAR(100) DEFAULT NULL AFTER centralidad;
ALTER TABLE atractivos ADD COLUMN categoria VARCHAR(100) DEFAULT NULL AFTER id_tipo;
ALTER TABLE atractivos ADD COLUMN tipo VARCHAR(100) DEFAULT NULL AFTER categoria;
ALTER TABLE atractivos ADD COLUMN sub_tipo VARCHAR(100) DEFAULT NULL AFTER tipo;
ALTER TABLE atractivos ADD COLUMN publica ENUM('Si','No') DEFAULT NULL AFTER sub_tipo;
ALTER TABLE atractivos ADD COLUMN privada ENUM('Si','No') DEFAULT NULL AFTER publica;
ALTER TABLE atractivos ADD COLUMN breve_descripcion TEXT DEFAULT NULL AFTER descripcion;
ALTER TABLE atractivos ADD COLUMN servicios_incluidos TEXT DEFAULT NULL AFTER breve_descripcion;
ALTER TABLE atractivos ADD COLUMN acceso_de_transporte TEXT DEFAULT NULL AFTER servicios_incluidos;
ALTER TABLE atractivos ADD COLUMN restriccion_a_la_accesibilidad TEXT DEFAULT NULL AFTER acceso_de_transporte;
ALTER TABLE atractivos ADD COLUMN pet_friendly ENUM('Si','No') DEFAULT NULL AFTER restriccion_a_la_accesibilidad;
ALTER TABLE atractivos ADD COLUMN contacto_telefono_correo_electronico VARCHAR(255) DEFAULT NULL AFTER pet_friendly;
ALTER TABLE atractivos ADD COLUMN dpa_manzana_localidad_del_atractivo VARCHAR(255) DEFAULT NULL AFTER contacto_telefono_correo_electronico;
ALTER TABLE atractivos ADD COLUMN observacion_de_inactivacion TEXT DEFAULT NULL AFTER dpa_manzana_localidad_del_atractivo;
