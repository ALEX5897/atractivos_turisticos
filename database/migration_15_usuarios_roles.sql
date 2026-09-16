-- Creación de tablas para sistema de roles y permisos

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permisos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  modulo VARCHAR(30) NOT NULL,
  accion VARCHAR(20) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla pivote: rol_permisos
CREATE TABLE IF NOT EXISTS rol_permisos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_rol INT NOT NULL,
  id_permiso INT NOT NULL,
  FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (id_permiso) REFERENCES permisos(id) ON DELETE CASCADE,
  UNIQUE(id_rol, id_permiso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columna id_rol a tabla usuarios
ALTER TABLE usuarios ADD COLUMN id_rol INT DEFAULT NULL;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles(id);

-- Insertar roles predefinidos
INSERT INTO roles (nombre, descripcion, estado) VALUES
('solo_vista', 'Solo lectura - Ver registros', 'ACTIVO'),
('digitador', 'Crear y editar registros', 'ACTIVO'),
('admin', 'Administrador - Crear, editar, eliminar (excepto usuarios)', 'ACTIVO'),
('super_admin', 'SuperAdministrador - Acceso total', 'ACTIVO');

-- Insertar permisos predefinidos (16 total: 4 módulos × 4 acciones)
-- Módulo: ATRACTIVOS
INSERT INTO permisos (codigo, nombre, descripcion, modulo, accion) VALUES
('ATRACTIVOS_VER', 'Ver Atractivos', 'Ver y listar atractivos', 'atractivos', 'ver'),
('ATRACTIVOS_CREAR', 'Crear Atractivos', 'Crear nuevos atractivos', 'atractivos', 'crear'),
('ATRACTIVOS_EDITAR', 'Editar Atractivos', 'Editar atractivos existentes', 'atractivos', 'editar'),
('ATRACTIVOS_ELIMINAR', 'Eliminar Atractivos', 'Eliminar atractivos', 'atractivos', 'eliminar'),

-- Módulo: EXPERIENCIAS
('EXPERIENCIAS_VER', 'Ver Experiencias', 'Ver y listar experiencias', 'experiencias', 'ver'),
('EXPERIENCIAS_CREAR', 'Crear Experiencias', 'Crear nuevas experiencias', 'experiencias', 'crear'),
('EXPERIENCIAS_EDITAR', 'Editar Experiencias', 'Editar experiencias existentes', 'experiencias', 'editar'),
('EXPERIENCIAS_ELIMINAR', 'Eliminar Experiencias', 'Eliminar experiencias', 'experiencias', 'eliminar'),

-- Módulo: RUTAS
('RUTAS_VER', 'Ver Rutas', 'Ver y listar rutas', 'rutas', 'ver'),
('RUTAS_CREAR', 'Crear Rutas', 'Crear nuevas rutas', 'rutas', 'crear'),
('RUTAS_EDITAR', 'Editar Rutas', 'Editar rutas existentes', 'rutas', 'editar'),
('RUTAS_ELIMINAR', 'Eliminar Rutas', 'Eliminar rutas', 'rutas', 'eliminar'),

-- Módulo: CATALOGOS
('CATALOGOS_VER', 'Ver Catálogos', 'Ver catálogos maestros', 'catalogos', 'ver'),
('CATALOGOS_CREAR', 'Crear Catálogos', 'Crear elementos en catálogos', 'catalogos', 'crear'),
('CATALOGOS_EDITAR', 'Editar Catálogos', 'Editar elementos en catálogos', 'catalogos', 'editar'),
('CATALOGOS_ELIMINAR', 'Eliminar Catálogos', 'Eliminar elementos en catálogos', 'catalogos', 'eliminar'),

-- Módulo: USUARIOS
('USUARIOS_VER', 'Ver Usuarios', 'Ver y listar usuarios', 'usuarios', 'ver'),
('USUARIOS_CREAR', 'Crear Usuarios', 'Crear nuevos usuarios', 'usuarios', 'crear'),
('USUARIOS_EDITAR', 'Editar Usuarios', 'Editar usuarios existentes', 'usuarios', 'editar'),
('USUARIOS_ELIMINAR', 'Eliminar Usuarios', 'Eliminar usuarios', 'usuarios', 'eliminar'),

-- Módulo: ROLES
('ROLES_VER', 'Ver Roles', 'Ver y listar roles', 'roles', 'ver'),
('ROLES_CREAR', 'Crear Roles', 'Crear nuevos roles', 'roles', 'crear'),
('ROLES_EDITAR', 'Editar Roles', 'Editar roles existentes', 'roles', 'editar'),
('ROLES_ELIMINAR', 'Eliminar Roles', 'Eliminar roles', 'roles', 'eliminar');

-- Asignar permisos a rol "solo_vista" (solo VER)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'solo_vista' AND p.accion = 'ver';

-- Asignar permisos a rol "digitador" (VER, CREAR, EDITAR - excepto usuarios y roles)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'digitador'
AND p.accion IN ('ver', 'crear', 'editar')
AND p.modulo NOT IN ('usuarios', 'roles');

-- Asignar permisos a rol "admin" (TODO excepto usuarios y roles)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'admin'
AND p.modulo NOT IN ('usuarios', 'roles');

-- Asignar permisos a rol "super_admin" (TODO)
INSERT INTO rol_permisos (id_rol, id_permiso)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'super_admin';
