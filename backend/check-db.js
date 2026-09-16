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

    console.log('=== USUARIOS ===');
    const [usuarios] = await conn.query('SELECT u.id, u.username, u.email, u.id_rol, r.nombre as rol FROM usuarios u LEFT JOIN roles r ON u.id_rol = r.id');
    usuarios.forEach(u => console.log(`${u.id} | ${u.username} | ${u.email} | Rol: ${u.rol}`));

    console.log('\n=== ROLES ===');
    const [roles] = await conn.query('SELECT * FROM roles');
    roles.forEach(r => console.log(`${r.id} | ${r.nombre} | ${r.estado}`));

    console.log('\n=== ROL ADMIN PERMISOS ===');
    const [adminRole] = await conn.query('SELECT id FROM roles WHERE nombre = "admin"');
    if (adminRole.length > 0) {
      const adminId = adminRole[0].id;
      const [adminPermisos] = await conn.query(
        'SELECT p.codigo, p.nombre FROM rol_permisos rp JOIN permisos p ON rp.id_permiso = p.id WHERE rp.id_rol = ?',
        [adminId]
      );
      console.log(`Admin role (id=${adminId}) tiene ${adminPermisos.length} permisos:`);
      adminPermisos.forEach(p => console.log(`  - ${p.codigo}`));
    } else {
      console.log('No existe rol "admin"');
    }

    conn.release();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
