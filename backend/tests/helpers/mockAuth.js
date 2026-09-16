// Mock middleware para tests
// Simula un usuario autenticado sin validar JWT

module.exports = (req, res, next) => {
  req.user = {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    name: 'Admin User',
    roles: ['ADMIN']
  };
  next();
};
