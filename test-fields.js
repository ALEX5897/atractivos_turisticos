const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'QT426*',
  database: 'atractivos_turisticos'
});

conn.query('SELECT id_ruta, nombre, contacto_telefono, contacto_correo_electronico, dpa_manzana_localidad_atractivo FROM rutas LIMIT 1', (err, results) => {
  if (err) {
    console.log('Error:', err.message);
  } else if (results && results.length > 0) {
    console.log('Registro encontrado:');
    console.log('ID:', results[0].id_ruta);
    console.log('Nombre:', results[0].nombre);
    console.log('Teléfono:', results[0].contacto_telefono);
    console.log('Email:', results[0].contacto_correo_electronico);
    console.log('DPA:', results[0].dpa_manzana_localidad_atractivo);
  } else {
    console.log('Sin registros');
  }
  conn.end();
});
