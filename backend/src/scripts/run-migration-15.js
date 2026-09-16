require('dotenv').config()
const pool = require('../config/database')

async function runMigration() {
  const conn = await pool.getConnection()
  try {
    console.log('Iniciando migración 15: Tablas de usuarios y roles...\n')

    // 1. Crear tabla roles
    console.log('Creando tabla roles...')
    await conn.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(50) UNIQUE NOT NULL,
        descripcion TEXT,
        estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('  ✓ Tabla roles creada\n')

    // 2. Crear tabla permisos
    console.log('Creando tabla permisos...')
    await conn.query(`
      CREATE TABLE IF NOT EXISTS permisos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        modulo VARCHAR(30) NOT NULL,
        accion VARCHAR(20) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('  ✓ Tabla permisos creada\n')

    // 3. Crear tabla rol_permisos
    console.log('Creando tabla rol_permisos...')
    await conn.query(`
      CREATE TABLE IF NOT EXISTS rol_permisos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        id_rol INT NOT NULL,
        id_permiso INT NOT NULL,
        FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (id_permiso) REFERENCES permisos(id) ON DELETE CASCADE,
        UNIQUE(id_rol, id_permiso)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('  ✓ Tabla rol_permisos creada\n')

    // 4. Agregar columna a usuarios
    console.log('Modificando tabla usuarios...')
    try {
      await conn.query(`ALTER TABLE usuarios ADD COLUMN id_rol INT DEFAULT NULL`)
      await conn.query(`ALTER TABLE usuarios ADD CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles(id)`)
      console.log('  ✓ Columna id_rol agregada a usuarios\n')
    } catch (err) {
      if (err.message.includes('Duplicate column')) {
        console.log('  ⚠ Columna id_rol ya existe\n')
      } else {
        throw err
      }
    }

    // 5. Insertar roles
    console.log('Insertando roles predefinidos...')
    await conn.query(`
      INSERT IGNORE INTO roles (nombre, descripcion, estado) VALUES
      ('solo_vista', 'Solo lectura - Ver registros', 'ACTIVO'),
      ('digitador', 'Crear y editar registros', 'ACTIVO'),
      ('admin', 'Administrador - Crear, editar, eliminar (excepto usuarios)', 'ACTIVO'),
      ('super_admin', 'SuperAdministrador - Acceso total', 'ACTIVO')
    `)
    console.log('  ✓ Roles insertados\n')

    // 6. Insertar permisos
    console.log('Insertando permisos predefinidos...')
    await conn.query(`
      INSERT IGNORE INTO permisos (codigo, nombre, descripcion, modulo, accion) VALUES
      ('ATRACTIVOS_VER', 'Ver Atractivos', 'Ver y listar atractivos', 'atractivos', 'ver'),
      ('ATRACTIVOS_CREAR', 'Crear Atractivos', 'Crear nuevos atractivos', 'atractivos', 'crear'),
      ('ATRACTIVOS_EDITAR', 'Editar Atractivos', 'Editar atractivos existentes', 'atractivos', 'editar'),
      ('ATRACTIVOS_ELIMINAR', 'Eliminar Atractivos', 'Eliminar atractivos', 'atractivos', 'eliminar'),
      ('EXPERIENCIAS_VER', 'Ver Experiencias', 'Ver y listar experiencias', 'experiencias', 'ver'),
      ('EXPERIENCIAS_CREAR', 'Crear Experiencias', 'Crear nuevas experiencias', 'experiencias', 'crear'),
      ('EXPERIENCIAS_EDITAR', 'Editar Experiencias', 'Editar experiencias existentes', 'experiencias', 'editar'),
      ('EXPERIENCIAS_ELIMINAR', 'Eliminar Experiencias', 'Eliminar experiencias', 'experiencias', 'eliminar'),
      ('RUTAS_VER', 'Ver Rutas', 'Ver y listar rutas', 'rutas', 'ver'),
      ('RUTAS_CREAR', 'Crear Rutas', 'Crear nuevas rutas', 'rutas', 'crear'),
      ('RUTAS_EDITAR', 'Editar Rutas', 'Editar rutas existentes', 'rutas', 'editar'),
      ('RUTAS_ELIMINAR', 'Eliminar Rutas', 'Eliminar rutas', 'rutas', 'eliminar'),
      ('CATALOGOS_VER', 'Ver Catálogos', 'Ver catálogos maestros', 'catalogos', 'ver'),
      ('CATALOGOS_CREAR', 'Crear Catálogos', 'Crear elementos en catálogos', 'catalogos', 'crear'),
      ('CATALOGOS_EDITAR', 'Editar Catálogos', 'Editar elementos en catálogos', 'catalogos', 'editar'),
      ('CATALOGOS_ELIMINAR', 'Eliminar Catálogos', 'Eliminar elementos en catálogos', 'catalogos', 'eliminar'),
      ('USUARIOS_VER', 'Ver Usuarios', 'Ver y listar usuarios', 'usuarios', 'ver'),
      ('USUARIOS_CREAR', 'Crear Usuarios', 'Crear nuevos usuarios', 'usuarios', 'crear'),
      ('USUARIOS_EDITAR', 'Editar Usuarios', 'Editar usuarios existentes', 'usuarios', 'editar'),
      ('USUARIOS_ELIMINAR', 'Eliminar Usuarios', 'Eliminar usuarios', 'usuarios', 'eliminar'),
      ('ROLES_VER', 'Ver Roles', 'Ver y listar roles', 'roles', 'ver'),
      ('ROLES_CREAR', 'Crear Roles', 'Crear nuevos roles', 'roles', 'crear'),
      ('ROLES_EDITAR', 'Editar Roles', 'Editar roles existentes', 'roles', 'editar'),
      ('ROLES_ELIMINAR', 'Eliminar Roles', 'Eliminar roles', 'roles', 'eliminar')
    `)
    console.log('  ✓ Permisos insertados\n')

    // 7. Asignar permisos a roles
    console.log('Asignando permisos a roles...')

    // Solo Vista: solo VER
    await conn.query(`
      INSERT IGNORE INTO rol_permisos (id_rol, id_permiso)
      SELECT r.id, p.id FROM roles r, permisos p
      WHERE r.nombre = 'solo_vista' AND p.accion = 'ver'
    `)
    console.log('  ✓ Permisos asignados a "solo_vista"')

    // Digitador: VER, CREAR, EDITAR (excepto usuarios y roles)
    await conn.query(`
      INSERT IGNORE INTO rol_permisos (id_rol, id_permiso)
      SELECT r.id, p.id FROM roles r, permisos p
      WHERE r.nombre = 'digitador'
      AND p.accion IN ('ver', 'crear', 'editar')
      AND p.modulo NOT IN ('usuarios', 'roles')
    `)
    console.log('  ✓ Permisos asignados a "digitador"')

    // Admin: TODO excepto usuarios y roles
    await conn.query(`
      INSERT IGNORE INTO rol_permisos (id_rol, id_permiso)
      SELECT r.id, p.id FROM roles r, permisos p
      WHERE r.nombre = 'admin'
      AND p.modulo NOT IN ('usuarios', 'roles')
    `)
    console.log('  ✓ Permisos asignados a "admin"')

    // SuperAdmin: TODO
    await conn.query(`
      INSERT IGNORE INTO rol_permisos (id_rol, id_permiso)
      SELECT r.id, p.id FROM roles r, permisos p
      WHERE r.nombre = 'super_admin'
    `)
    console.log('  ✓ Permisos asignados a "super_admin"\n')

    // Verificación
    console.log('=== Verificación de Tablas ===\n')
    const [roles] = await conn.query('SELECT COUNT(*) as count FROM roles')
    const [permisos] = await conn.query('SELECT COUNT(*) as count FROM permisos')
    const [rolPermisos] = await conn.query('SELECT COUNT(*) as count FROM rol_permisos')

    console.log(`✓ Roles: ${roles[0].count}`)
    console.log(`✓ Permisos: ${permisos[0].count}`)
    console.log(`✓ Rol-Permisos: ${rolPermisos[0].count}\n`)

    // Mostrar roles
    console.log('=== Roles Creados ===\n')
    const [rolesData] = await conn.query(`
      SELECT r.id, r.nombre, r.descripcion, COUNT(rp.id_permiso) as permisos_count
      FROM roles r
      LEFT JOIN rol_permisos rp ON r.id = rp.id_rol
      GROUP BY r.id
      ORDER BY r.id
    `)
    rolesData.forEach(role => {
      console.log(`${role.id}. ${role.nombre}: ${role.permisos_count} permisos`)
      console.log(`   ${role.descripcion}\n`)
    })

    console.log('✓ Migración 15 completada exitosamente')
    process.exit(0)
  } catch (err) {
    console.error('\n✗ Error durante la migración:', err.message)
    console.error(err)
    process.exit(1)
  } finally {
    await conn.end()
  }
}

runMigration()
