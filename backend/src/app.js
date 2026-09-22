require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const { testConnection, runMigrations } = require('./config/database')

const authRoutes = require('./routes/auth')
const dashboardRoutes = require('./routes/dashboard')
const catalogosRoutes = require('./routes/catalogos')
const catalogosAdminRoutes = require('./routes/catalogos-admin')
const atractivosRoutes = require('./routes/atractivos')
const experienciasRoutes = require('./routes/experiencias')
const rutasRoutes = require('./routes/rutas')
const usuariosRoutes = require('./routes/usuarios')
const rolesRoutes = require('./routes/roles')
const auditoriaRoutes = require('./routes/auditoria')
const reportesRoutes = require('./routes/reportes')

const app = express()
const PORT = process.env.PORT || 4000

// Rate limiting: máximo 20 intentos de login por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos, intente en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(cors({
  origin: (origin, callback) => {
    // En desarrollo, permite localhost y red local en cualquier puerto
    if (process.env.NODE_ENV === 'development') {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.startsWith('http://192.168') || origin.startsWith('http://172.')) {
        return callback(null, true)
      }
    }
    // En producción, usa la variable de entorno (admite varios orígenes separados por coma)
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, origin)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.use(cookieParser())

// Middleware de debug para login
app.use('/api/auth/login', (req, res, next) => {
  console.log('[DEBUG] Login attempt:')
  console.log('  Method:', req.method)
  console.log('  Body:', JSON.stringify(req.body))
  console.log('  Headers:', {
    'content-type': req.headers['content-type'],
    'origin': req.headers['origin'],
    'user-agent': req.headers['user-agent'],
  })
  console.log('  Cookies:', req.cookies)
  next()
})

// Rutas
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/catalogos', catalogosRoutes)
app.use('/api/catalogos-admin', catalogosAdminRoutes)
app.use('/api/atractivos', atractivosRoutes)
app.use('/api/experiencias', experienciasRoutes)
app.use('/api/rutas', rutasRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/roles', rolesRoutes)
app.use('/api/auditoria', auditoriaRoutes)
app.use('/api/reportes', reportesRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Test endpoint para verificar comunicación frontend-backend
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend conectado correctamente', timestamp: new Date().toISOString() })
})

// Debug endpoint
app.post('/api/debug/login', (req, res) => {
  res.json({
    debug: {
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'origin': req.headers['origin'],
      },
      cookies: req.cookies,
      message: 'Debug info'
    }
  })
})

// Handler global de errores
app.use((err, req, res, _next) => {
  console.error('Error no manejado:', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

async function start() {
  try {
    await testConnection()
    await runMigrations()
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend corriendo en http://0.0.0.0:${PORT}`)
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (err) {
    console.error('No se pudo iniciar la aplicación:', err.message)
    process.exit(1)
  }
}

start()
