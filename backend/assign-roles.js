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

    // Asignar rol admin a todos los usuarios
    await conn.query('UPDATE usuarios SET id_rol = ? WHERE id_rol IS NULL', [adminId]);
    
    console.log('✓ Usuarios actualizados con rol admin');

    // Verificar
    const [usuarios] = await conn.query('SELECT u.id, u.username, r.nombre as rol FROM usuarios u LEFT JOIN roles r ON u.id_rol = r.id');
    console.log('\n=== USUARIOS (actualizado) ===');
    usuarios.forEach(u => console.log(`${u.id} | ${u.username} | Rol: ${u.rol}`));

    conn.release();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
