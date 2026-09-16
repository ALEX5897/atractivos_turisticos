const axios = require('axios')
const crypto = require('crypto')
const { getConnection } = require('./database')

const keycloakConfig = {
  baseUrl: process.env.KEYCLOAK_BASE_URL,
  realm: process.env.KEYCLOAK_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
}

const tokenUrl = `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`
const introspectUrl = `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token/introspect`
const logoutUrl = `${keycloakConfig.baseUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`

// Autenticación local contra BD (sin Keycloak)
async function authenticateLocal(username, password) {
  const conn = await getConnection()
  try {
    const [users] = await conn.query('SELECT * FROM usuarios WHERE username = ? AND estado = ?', [
      username,
      'activo',
    ])

    if (users.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    const user = users[0]
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

    if (user.password_hash !== passwordHash) {
      throw new Error('Contraseña incorrecta')
    }

    // Devuelve tokens JWT firmados localmente
    const jwt = require('jsonwebtoken')
    const accessToken = jwt.sign(
      {
        sub: user.id,
        preferred_username: user.username,
        email: user.email,
        name: user.nombre,
        realm_access: { roles: ['user'] },
      },
      process.env.JWT_SECRET || 'cambiar-por-clave-segura-de-minimo-32-caracteres-aqui',
      { expiresIn: '8h' }
    )

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET || 'cambiar-por-clave-segura-de-minimo-32-caracteres-aqui',
      { expiresIn: '7d' }
    )

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 8 * 60 * 60,
      refresh_expires_in: 7 * 24 * 60 * 60,
      token_type: 'Bearer',
    }
  } finally {
    conn.release()
  }
}

// Direct Grant: intercambia usuario/contraseña por tokens (Keycloak)
async function authenticate(username, password) {
  // Intenta autenticación local primero
  try {
    console.log('[Auth] Intentando autenticación local para usuario:', username)
    const result = await authenticateLocal(username, password)
    console.log('[Auth] ✓ Autenticación local exitosa para:', username)
    return result
  } catch (localErr) {
    console.log('[Auth] ✗ Autenticación local falló:', localErr.message)

    // Verifica si Keycloak está configurado
    if (!keycloakConfig.baseUrl || !keycloakConfig.clientId) {
      console.log('[Auth] ✗ Keycloak no está configurado, solo autenticación local disponible')
      throw localErr
    }

    console.log('[Auth] Intentando autenticación contra Keycloak...')
    try {
      // Si falla, intenta contra Keycloak
      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: keycloakConfig.clientId,
        client_secret: keycloakConfig.clientSecret,
        username,
        password,
        scope: 'openid profile email',
      })

      const response = await axios.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000,
      })

      console.log('[Auth] ✓ Autenticación Keycloak exitosa para:', username)

      // Sincronizar usuario Keycloak: si no existe en BD, crear con rol "solo vista"
      const jwt = require('jsonwebtoken')
      const decoded = jwt.decode(response.data.access_token)

      if (decoded) {
        try {
          await syncKeycloakUser(decoded)
        } catch (syncErr) {
          console.error('[Sync] Error sincronizando usuario:', syncErr.message)
          // Continúa aunque la sincronización falle
        }
      }

      return response.data
    } catch (keycloakErr) {
      console.log('[Auth] ✗ Keycloak falló:', keycloakErr.response?.data?.error_description || keycloakErr.message)
      throw keycloakErr
    }
  }
}

// Renueva el access_token usando el refresh_token
async function refreshToken(refreshToken) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: keycloakConfig.clientId,
    client_secret: keycloakConfig.clientSecret,
    refresh_token: refreshToken,
  })

  const response = await axios.post(tokenUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  return response.data
}

// Verifica si un token es válido en Keycloak
async function introspectToken(token) {
  const params = new URLSearchParams({
    client_id: keycloakConfig.clientId,
    client_secret: keycloakConfig.clientSecret,
    token,
  })

  const response = await axios.post(introspectUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  return response.data
}

// Invalida los tokens en Keycloak (logout)
async function revokeToken(refreshToken) {
  const params = new URLSearchParams({
    client_id: keycloakConfig.clientId,
    client_secret: keycloakConfig.clientSecret,
    refresh_token: refreshToken,
  })

  await axios.post(logoutUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

// Sincroniza usuario de Keycloak a BD local con rol "solo vista"
async function syncKeycloakUser(tokenPayload) {
  const { preferred_username: username, email, name, sub: keycloak_id } = tokenPayload

  if (!username) {
    console.log('[Sync] Token sin username, skipping sync')
    return
  }

  const conn = await getConnection()
  try {
    // Verificar si el usuario existe
    const [existing] = await conn.query(
      'SELECT id FROM usuarios WHERE username = ?',
      [username]
    )

    if (existing.length > 0) {
      // Usuario existe, no hacer nada
      console.log('[Sync] Usuario', username, 'ya existe en BD')
      return
    }

    // Obtener el ID del rol "solo_vista"
    const [roles] = await conn.query(
      'SELECT id FROM roles WHERE nombre = "solo_vista" LIMIT 1'
    )

    if (roles.length === 0) {
      console.log('[Sync] ✗ Rol "solo_vista" no encontrado')
      return
    }

    const roleId = roles[0].id

    // Crear usuario con rol "solo_vista"
    const [result] = await conn.query(
      'INSERT INTO usuarios (username, email, nombre, estado, id_rol) VALUES (?, ?, ?, "ACTIVO", ?)',
      [username, email || null, name || username, roleId]
    )

    console.log('[Sync] ✓ Usuario', username, 'sincronizado con rol "solo_vista"')
  } catch (err) {
    console.error('[Sync] Error sincronizando usuario:', err.message)
  } finally {
    conn.release()
  }
}

module.exports = { authenticate, refreshToken, introspectToken, revokeToken, syncKeycloakUser }
