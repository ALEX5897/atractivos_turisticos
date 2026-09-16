require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    const conn = await pool.getConnection();

    // Obtener id del rol admin
    const [adminRole] = await conn.query('SELECT id FROM roles WHERE nombre = "admin"');
    const adminId = adminRole[0].id;

    // Obtener IDs de permisos USUARIOS y ROLES
    const [userRolePermisos] = await conn.query(
      `SELECT id FROM permisos WHERE codigo IN (
        'USUARIOS_VER', 'USUARIOS_EDITAR', 'USUARIOS_ELIMINAR',
        'ROLES_VER', 'ROLES_CREAR', 'ROLES_EDITAR', 'ROLES_ELIMINAR'
      )`
    );

    console.log(`Encontrados ${userRolePermisos.length} permisos para asignar`);

    // Asignar permisos al rol admin
    for (const perm of userRolePermisos) {
      try {
        await conn.query(
          'INSERT INTO rol_permisos (id_rol, id_permiso) VALUES (?, ?) ON DUPLICATE KEY UPDATE id_rol = id_rol',
          [adminId, perm.id]
        );
      } catch (e) {
        // Ignorar si ya existe
      }
    }

    console.log('✓ Permisos asignados al rol admin');

    // Verificar
    const [adminPermisos] = await conn.query(
      'SELECT p.codigo FROM rol_permisos rp JOIN permisos p ON rp.id_permiso = p.id WHERE rp.id_rol = ? ORDER BY p.codigo',
      [adminId]
    );
    console.log('\n=== ROL ADMIN PERMISOS (actualizado) ===');
    adminPermisos.forEach(p => console.log(`  - ${p.codigo}`));

    conn.release();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
