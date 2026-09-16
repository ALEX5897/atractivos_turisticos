const express = require('express')
const router = express.Router()
const { authenticate, refreshToken, revokeToken } = require('../config/keycloak')
const { requireAuth } = require('../middleware/auth')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 8 * 60 * 60 * 1000, // 8 horas
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' })
  }

  try {
    const tokens = await authenticate(username, password)

    // Guarda tokens en cookies httpOnly (no accesibles desde JS del browser)
    res.cookie('access_token', tokens.access_token, COOKIE_OPTIONS)
    res.cookie('refresh_token', tokens.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: tokens.refresh_expires_in * 1000,
    })

    return res.json({
      message: 'Autenticación exitosa',
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
    })
  } catch (err) {
    console.error('Error en login:', err.message)
    console.error('Stack:', err.stack)

    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    if (err.message && err.message.includes('Usuario no encontrado')) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    }

    if (err.message && err.message.includes('Contraseña incorrecta')) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    }

    // Error del servidor
    console.error('Error de autenticación completo:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refresh_token

  if (!token) {
    return res.status(401).json({ error: 'Refresh token no encontrado' })
  }

  try {
    const tokens = await refreshToken(token)

    res.cookie('access_token', tokens.access_token, COOKIE_OPTIONS)
    res.cookie('refresh_token', tokens.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: tokens.refresh_expires_in * 1000,
    })

    return res.json({ message: 'Token renovado', expires_in: tokens.expires_in })
  } catch {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return res.status(401).json({ error: 'Refresh token inválido o expirado' })
  }
})

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  const token = req.cookies?.refresh_token

  try {
    if (token) await revokeToken(token)
  } catch {
    // Continúa el logout aunque Keycloak falle
  }

  res.clearCookie('access_token')
  res.clearCookie('refresh_token')
  return res.json({ message: 'Sesión cerrada correctamente' })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user })
})

module.exports = router
