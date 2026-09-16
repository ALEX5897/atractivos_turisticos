-- Crear tabla de Subcentralidades
CREATE TABLE IF NOT EXISTS cat_subcentralidades (
  id_subcentralidad SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL,
  cod_subcentralidad VARCHAR(10) DEFAULT NULL,
  activo            TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_subcentralidad_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de subcentralidades basados en parroquias
INSERT INTO cat_subcentralidades (nombre, cod_subcentralidad) VALUES
  ('Belisario Quevedo', 'SC-001'),
  ('Carcelén', 'SC-002'),
  ('Cochapamba', 'SC-003'),
  ('Comité del Pueblo', 'SC-004'),
  ('El Condado', 'SC-005'),
  ('Cotocollao', 'SC-006'),
  ('Ponceano', 'SC-007'),
  ('San Isidro del Inca', 'SC-008'),
  ('Zámbiza', 'SC-009'),
  ('Centro Histórico', 'SC-010'),
  ('Itchimbía', 'SC-011'),
  ('Puengasí', 'SC-012'),
  ('San Juan', 'SC-013'),
  ('La Libertad', 'SC-014'),
  ('Chilibulo', 'SC-015'),
  ('Chillogallo', 'SC-016'),
  ('Guamaní', 'SC-017'),
  ('La Argelia', 'SC-018'),
  ('La Ecuatoriana', 'SC-019'),
  ('La Ferroviaria', 'SC-020'),
  ('La Magdalena', 'SC-021'),
  ('La Mena', 'SC-022'),
  ('Quitumbe', 'SC-023'),
  ('Solanda', 'SC-024'),
  ('Turubamba', 'SC-025'),
  ('Cumbayá', 'SC-026'),
  ('Tumbaco', 'SC-027'),
  ('Conocoto', 'SC-028'),
  ('Amaguaña', 'SC-029'),
  ('Calderón', 'SC-030');
