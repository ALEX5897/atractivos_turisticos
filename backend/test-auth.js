require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

(async () => {
  try {
    // Login
    console.log('=== LOGIN ===');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin'
    }, {
      withCredentials: true
    });

    console.log('Login response:', loginRes.data);
    const cookies = loginRes.headers['set-cookie'];
    console.log('Cookies recibidas:', cookies ? 'Sí' : 'No');

    // Get /auth/me con cookies
    console.log('\n=== GET /auth/me ===');
    try {
      const meRes = await axios.get(`${BASE_URL}/auth/me`, {
        withCredentials: true,
        headers: {
          Cookie: cookies ? cookies.map(c => c.split(';')[0]).join('; ') : ''
        }
      });
      console.log('User:', JSON.stringify(meRes.data.user, null, 2));
    } catch (e) {
      console.error('Error en /auth/me:', e.response?.data || e.message);
    }

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    console.error('Response:', e.response?.data);
    process.exit(1);
  }
})();
