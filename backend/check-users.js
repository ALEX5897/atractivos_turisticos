const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'QT426*',
      database: 'atractivos_turisticos'
    });

    const [rows] = await connection.execute('SELECT id, username, email FROM usuarios LIMIT 10');
    console.log('\n✅ Usuarios en la BD:');
    console.table(rows);

    await connection.end();
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }
}

checkUsers();
