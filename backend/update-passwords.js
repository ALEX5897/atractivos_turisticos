const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function updatePasswords() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'QT426*',
      database: 'atractivos_turisticos'
    });

    // Contraseña para admin
    const adminPassword = 'admin123';
    const adminHash = crypto.createHash('sha256').update(adminPassword).digest('hex');

    // Contraseña para acasa
    const acasaPassword = '@Samu_110516';
    const acasaHash = crypto.createHash('sha256').update(acasaPassword).digest('hex');

    // Actualizar admin
    await connection.execute(
      'UPDATE usuarios SET password_hash = ? WHERE username = ?',
      [adminHash, 'admin']
    );
    console.log('✅ Contraseña de admin actualizada');
    console.log(`   Usuario: admin`);
    console.log(`   Contraseña: ${adminPassword}`);

    // Actualizar acasa
    await connection.execute(
      'UPDATE usuarios SET password_hash = ? WHERE username = ?',
      [acasaHash, 'acasa']
    );
    console.log('\n✅ Contraseña de acasa actualizada');
    console.log(`   Usuario: acasa`);
    console.log(`   Contraseña: ${acasaPassword}`);

    await connection.end();
    console.log('\n✅ Contraseñas actualizadas exitosamente');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

updatePasswords();
