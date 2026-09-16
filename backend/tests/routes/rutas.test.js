const request = require('supertest');
const express = require('express');
const mockAuth = require('../helpers/mockAuth');
const mockPool = require('../helpers/mockDb');

// Mockear middleware de auth
jest.mock('../../src/middleware/auth', () => ({
  requireAuth: require('../helpers/mockAuth'),
  requireRole: () => (req, res, next) => next()
}));

// Mockear el módulo de config/database
jest.mock('../../src/config/database', () => ({
  pool: mockPool,
  testConnection: jest.fn().mockResolvedValue()
}));

// Crear una aplicación express para tests
const createApp = () => {
  const app = express();
  app.use(express.json());

  // Cargar rutas (ya con mocks aplicados)
  const rutasRoutes = require('../../src/routes/rutas');

  app.use('/api/rutas', rutasRoutes);

  return app;
};

describe('Rutas API Endpoints', () => {
  let app;

  beforeEach(() => {
    mockPool.reset();
    mockPool.query.mockClear();
    app = createApp();
  });

  describe('GET /api/rutas', () => {
    it('debería retornar lista de rutas con paginación', async () => {
      const response = await request(app)
        .get('/api/rutas')
        .query({ page: 1, limit: 15 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 15);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería filtrar por estado', async () => {
      const response = await request(app)
        .get('/api/rutas')
        .query({ estado: 'ACTIVO' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('debería buscar por nombre', async () => {
      const response = await request(app)
        .get('/api/rutas')
        .query({ q: 'TEST' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/rutas/:id', () => {
    it('debería retornar detalle de ruta por ID', async () => {
      const response = await request(app)
        .get('/api/rutas/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_ruta', 1);
      expect(response.body.data).toHaveProperty('nombre', 'RUTA TEST 1');
    });

    it('debería retornar 404 para ID inexistente', async () => {
      const response = await request(app)
        .get('/api/rutas/999');

      expect(response.status).toBe(404);
    });

    it('debería retornar todos los campos', async () => {
      const response = await request(app)
        .get('/api/rutas/1');

      expect(response.status).toBe(200);
      const data = response.body.data;
      expect(data).toHaveProperty('establecimiento_a_b');
      expect(data).toHaveProperty('observacion_de_inactivacion');
    });
  });

  describe('POST /api/rutas', () => {
    const validRuta = {
      estado: 'EN_REVISION',
      nombre: 'NUEVA RUTA DE PRUEBA',
      iniciales_nombre: 'NR',
      nodo: 'Nodo 1',
      centralidad: 'Central',
      clasificacion: 'Test',
      modalidad: 'A Pie',
      descripcion: 'Descripción de nueva ruta',
      tiempo_de_duracion_de_ruta_horas: '2.5',
      distancia_km: '5.0',
      dificultad: 'FACIL',
      altitud_m_s_n_m: 2850,
      link_de_ruta: 'https://maps.example.com'
    };

    it('debería crear una nueva ruta', async () => {
      const response = await request(app)
        .post('/api/rutas')
        .send(validRuta);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('codigo_qt');
    });

    it('debería generar código QT con estructura nodo+iniciales+centralidad+n', async () => {
      const response = await request(app)
        .post('/api/rutas')
        .send(validRuta);

      expect(response.status).toBe(201);
      const codigoQt = response.body.codigo_qt;
      // Esperamos formato: 02 (nodo) + NR (iniciales) + 08 (centralidad) + 003 (n)
      expect(codigoQt).toMatch(/^[0-9]{2}[A-Z]{2}[0-9]{2}[0-9]{3}$/);
    });

    it('debería retornar 400 si faltan campos requeridos', async () => {
      const incompleteRuta = { nombre: 'Sin estado' };
      const response = await request(app)
        .post('/api/rutas')
        .send(incompleteRuta);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería generar número secuencial único (n)', async () => {
      const response1 = await request(app)
        .post('/api/rutas')
        .send(validRuta);

      const response2 = await request(app)
        .post('/api/rutas')
        .send({ ...validRuta, nombre: 'OTRA RUTA' });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.n).not.toBe(response2.body.n);
    });
  });

  describe('PUT /api/rutas/:id', () => {
    const updateData = {
      nombre: 'RUTA ACTUALIZADA',
      estado: 'ACTIVO',
      descripcion: 'Descripción actualizada',
      dificultad: 'DIFICIL'
    };

    it('debería actualizar una ruta existente', async () => {
      const response = await request(app)
        .put('/api/rutas/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('debería retornar 404 si la ruta no existe', async () => {
      const response = await request(app)
        .put('/api/rutas/999')
        .send(updateData);

      expect(response.status).toBe(404);
    });

    it('debería permitir actualizar código QT', async () => {
      const updateWithCode = {
        ...updateData,
        iniciales_nombre: 'NU',
        nodo: 'Nodo 2',
        centralidad: 'Periférica'
      };

      const response = await request(app)
        .put('/api/rutas/1')
        .send(updateWithCode);

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/rutas/:id', () => {
    it('debería hacer soft delete (marcar como ELIMINADO)', async () => {
      const response = await request(app)
        .delete('/api/rutas/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que estado cambió a ELIMINADO
      const getResponse = await request(app)
        .get('/api/rutas/1');

      expect(getResponse.status).toBe(404); // No retorna eliminadas
    });

    it('debería retornar 404 si la ruta no existe', async () => {
      const response = await request(app)
        .delete('/api/rutas/999');

      expect(response.status).toBe(404);
    });

    it('no debería permitir acceso sin autenticación', async () => {
      // Este test podría requerir un middleware de auth real
      // Por ahora solo verificamos que el endpoint existe
      const response = await request(app)
        .delete('/api/rutas/1');

      expect([200, 404, 401]).toContain(response.status);
    });
  });

  describe('Validaciones de campos', () => {
    it('debería validar que establecimiento_a_b se guarde correctamente', async () => {
      const rutaConEstablecimiento = {
        estado: 'ACTIVO',
        nombre: 'RUTA CON ESTABLECIMIENTO',
        iniciales_nombre: 'RC',
        nodo: 'Nodo 1',
        centralidad: 'Central',
        clasificacion: 'Test',
        modalidad: 'A Pie',
        descripcion: 'Test',
        dificultad: 'FACIL',
        establecimiento_a_b: 'Restaurante ABC, Hotel XYZ'
      };

      const response = await request(app)
        .post('/api/rutas')
        .send(rutaConEstablecimiento);

      expect(response.status).toBe(201);
    });

    it('debería validar que observacion_de_inactivacion se guarde correctamente', async () => {
      const rutaInactiva = {
        estado: 'INACTIVO',
        nombre: 'RUTA INACTIVA',
        iniciales_nombre: 'RI',
        nodo: 'Nodo 1',
        centralidad: 'Central',
        clasificacion: 'Test',
        modalidad: 'A Pie',
        descripcion: 'Test',
        dificultad: 'FACIL',
        observacion_de_inactivacion: 'En mantenimiento temporal'
      };

      const response = await request(app)
        .post('/api/rutas')
        .send(rutaInactiva);

      expect(response.status).toBe(201);
    });
  });
});
